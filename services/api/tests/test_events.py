import pytest
from app.models.event import Event
from app.models.event_participant import EventParticipant
from app.models.event_join_request import EventJoinRequest
from app.models.venue import TimeSlot, Court


class TestCreateEvent:
    """Tests for creating events"""

    def test_create_event_success(self, client, db, user, auth_headers):
        """Test creating an event successfully"""
        response = client.post("/events", headers=auth_headers, json={
            "title": "Test Basketball Game",
            "description": "Let's play basketball",
            "max_participants": 8,
            "visibility": "public",
            "duration_type": "temporary"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["title"] == "Test Basketball Game"
        assert data["status"] == "open"
        assert data["max_participants"] == 8
        assert data["current_participants"] == 1  # Owner is auto-added

    def test_create_event_minimal_fields(self, client, db, user, auth_headers):
        """Test creating event with minimal required fields"""
        response = client.post("/events", headers=auth_headers, json={
            "title": "Minimal Event",
            "max_participants": 4
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["title"] == "Minimal Event"
        assert data["visibility"] == "public"  # Default
        assert data["duration_type"] == "temporary"  # Default

    def test_create_event_missing_required_fields(self, client, db, user, auth_headers):
        """Test creating event with missing required fields fails"""
        response = client.post("/events", headers=auth_headers, json={
            "title": "Incomplete Event"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "missing_fields"

    def test_create_event_no_auth(self, client, db):
        """Test creating event without authentication fails"""
        response = client.post("/events", json={
            "title": "Test Event",
            "max_participants": 8
        })
        assert response.status_code == 401


class TestUpdateEvent:
    """Tests for updating events"""

    def test_update_event_success(self, client, db, user, event, auth_headers):
        """Test updating an event"""
        response = client.put(f"/events/{event.id}",
            headers=auth_headers,
            json={"title": "Updated Title", "status": "closed"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "closed"

    def test_update_event_not_owner(self, client, db, event, auth_headers_user2):
        """Test updating event as non-owner fails"""
        response = client.put(f"/events/{event.id}",
            headers=auth_headers_user2,
            json={"title": "Hacked Title"}
        )
        assert response.status_code == 403
        data = response.get_json()
        assert data["error"] == "not_owner"

    def test_update_event_not_found(self, client, db, user, auth_headers):
        """Test updating non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.put(f"/events/{fake_id}",
            headers=auth_headers,
            json={"title": "New Title"}
        )
        assert response.status_code == 404

    def test_update_event_no_auth(self, client, db, event):
        """Test updating event without authentication fails"""
        response = client.put(f"/events/{event.id}", json={
            "title": "New Title"
        })
        assert response.status_code == 401


class TestDeleteEvent:
    """Tests for deleting events"""

    def test_delete_event_success(self, client, db, user, event, auth_headers):
        """Test deleting an event"""
        response = client.delete(f"/events/{event.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["ok"] is True

        # Verify event is deleted
        deleted_event = db.query(Event).filter(Event.id == event.id).first()
        assert deleted_event is None

    def test_delete_event_not_owner(self, client, db, event, auth_headers_user2):
        """Test deleting event as non-owner fails"""
        response = client.delete(f"/events/{event.id}", headers=auth_headers_user2)
        assert response.status_code == 403

    def test_delete_event_not_found(self, client, db, user, auth_headers):
        """Test deleting non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.delete(f"/events/{fake_id}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_event_no_auth(self, client, db, event):
        """Test deleting event without authentication fails"""
        response = client.delete(f"/events/{event.id}")
        assert response.status_code == 401


class TestBookTimeSlotForEvent:
    """Tests for booking time slots for events"""

    def test_book_time_slot_success(self, client, db, user, event, venue, auth_headers):
        """Test booking a time slot for an event"""
        time_slot = db.query(TimeSlot).filter(TimeSlot.court_id.in_(
            db.query(Court.id).filter(Court.venue_id == venue.id)
        )).first()

        response = client.post(f"/events/{event.id}/book",
            headers=auth_headers,
            json={"time_slot_id": str(time_slot.id)}
        )
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["event_id"] == str(event.id)
        assert data["time_slot_id"] == str(time_slot.id)

    def test_book_time_slot_not_owner(self, client, db, event, venue, auth_headers_user2):
        """Test booking time slot as non-owner fails"""
        time_slot = db.query(TimeSlot).first()
        response = client.post(f"/events/{event.id}/book",
            headers=auth_headers_user2,
            json={"time_slot_id": str(time_slot.id)}
        )
        assert response.status_code == 403

    def test_book_time_slot_missing_id(self, client, db, user, event, auth_headers):
        """Test booking without time_slot_id fails"""
        response = client.post(f"/events/{event.id}/book",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 400

    def test_book_time_slot_no_auth(self, client, db, event, venue):
        """Test booking time slot without authentication fails"""
        time_slot = db.query(TimeSlot).first()
        response = client.post(f"/events/{event.id}/book", json={
            "time_slot_id": str(time_slot.id)
        })
        assert response.status_code == 401


class TestListEventBookings:
    """Tests for listing event bookings"""

    def test_list_event_bookings_success(self, client, db, event):
        """Test listing bookings for an event"""
        response = client.get(f"/events/{event.id}/bookings")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_list_event_bookings_not_found(self, client, db):
        """Test listing bookings for non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/events/{fake_id}/bookings")
        assert response.status_code == 404


class TestListEvents:
    """Tests for listing events"""

    def test_list_events_success(self, client, db, event):
        """Test listing all events"""
        response = client.get("/events")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_list_events_filter_by_status(self, client, db, event):
        """Test filtering events by status"""
        response = client.get("/events", query_string={"status": "open"})
        assert response.status_code == 200
        data = response.get_json()
        for event_data in data:
            assert event_data["status"] == "open"

    def test_list_events_filter_by_visibility(self, client, db, event):
        """Test filtering events by visibility"""
        response = client.get("/events", query_string={"visibility": "public"})
        assert response.status_code == 200
        data = response.get_json()
        for event_data in data:
            assert event_data["visibility"] == "public"

    def test_list_events_pagination(self, client, db, user, auth_headers):
        """Test events pagination"""
        # Create multiple events
        for i in range(5):
            client.post("/events", headers=auth_headers, json={
                "title": f"Event {i}",
                "max_participants": 8
            })

        response = client.get("/events", query_string={"limit": 3, "offset": 0})
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) <= 3


class TestSearchEvents:
    """Tests for searching events"""

    def test_search_events_success(self, client, db, event):
        """Test searching events by keyword"""
        response = client.get("/events/search", query_string={
            "keyword": "Basketball"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_search_events_no_keyword(self, client, db):
        """Test searching without keyword fails"""
        response = client.get("/events/search")
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "title_keyword_required"

    def test_search_events_empty_keyword(self, client, db):
        """Test searching with empty keyword fails"""
        response = client.get("/events/search", query_string={"keyword": "   "})
        assert response.status_code == 400


class TestGetEvent:
    """Tests for getting single event"""

    def test_get_event_success(self, client, db, event):
        """Test getting event details"""
        response = client.get(f"/events/{event.id}")
        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == str(event.id)
        assert data["title"] == event.title
        assert "participants" in data
        assert "bookings" in data

    def test_get_event_not_found(self, client, db):
        """Test getting non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/events/{fake_id}")
        assert response.status_code == 404


class TestJoinEvent:
    """Tests for joining events"""

    def test_join_event_authenticated_success(self, client, db, event, user2, auth_headers_user2):
        """Test authenticated user joining event"""
        response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "I'd like to join!"}
        )
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["status"] in ["submitted", "approved"]

    def test_join_event_unauthenticated(self, client, db, event):
        """Test non-member joining event"""
        response = client.post(f"/events/{event.id}/join", json={
            "applicant_name": "Guest User",
            "applicant_email": "guest@example.com",
            "message": "Can I join?"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["status"] == "submitted"

    def test_join_event_unauthenticated_missing_fields(self, client, db, event):
        """Test non-member joining without required fields"""
        response = client.post(f"/events/{event.id}/join", json={
            "message": "Can I join?"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "missing_fields"

    def test_join_event_not_found(self, client, db, user2, auth_headers_user2):
        """Test joining non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.post(f"/events/{fake_id}/join",
            headers=auth_headers_user2,
            json={"message": "Join request"}
        )
        assert response.status_code == 404

    def test_join_event_not_open(self, client, db, user, user2, event, auth_headers, auth_headers_user2):
        """Test joining closed event fails"""
        # Close the event
        client.put(f"/events/{event.id}",
            headers=auth_headers,
            json={"status": "closed"}
        )

        response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "Join request"}
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "event_not_open"

    def test_join_event_already_joined(self, client, db, user, event, auth_headers):
        """Test joining event user is already in fails"""
        response = client.post(f"/events/{event.id}/join",
            headers=auth_headers,
            json={"message": "Join again?"}
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "already_joined"


class TestListJoinRequests:
    """Tests for listing join requests"""

    def test_list_join_requests_success(self, client, db, user, event, auth_headers):
        """Test listing join requests as event owner"""
        response = client.get(f"/events/{event.id}/join-requests",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_list_join_requests_not_owner(self, client, db, event, auth_headers_user2):
        """Test listing join requests as non-owner fails"""
        response = client.get(f"/events/{event.id}/join-requests",
            headers=auth_headers_user2
        )
        assert response.status_code == 403

    def test_list_join_requests_no_auth(self, client, db, event):
        """Test listing join requests without authentication fails"""
        response = client.get(f"/events/{event.id}/join-requests")
        assert response.status_code == 401

    def test_list_join_requests_not_found(self, client, db, user, auth_headers):
        """Test listing join requests for non-existent event"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/events/{fake_id}/join-requests",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestReviewJoinRequest:
    """Tests for reviewing join requests"""

    def test_approve_join_request_success(self, client, db, user, user2, event, auth_headers, auth_headers_user2):
        """Test approving a join request"""
        # User2 submits join request
        join_response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "Let me join!"}
        )
        request_id = join_response.get_json()["id"]

        # Owner approves the request
        response = client.post(
            f"/events/{event.id}/join-requests/{request_id}/review",
            headers=auth_headers,
            json={"action": "approve"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["ok"] is True
        assert data["status"] == "approved"

        # Verify user2 is now a participant
        participant = db.query(EventParticipant).filter(
            EventParticipant.event_id == event.id,
            EventParticipant.user_id == user2.id
        ).first()
        assert participant is not None

    def test_reject_join_request_success(self, client, db, user, user2, event, auth_headers, auth_headers_user2):
        """Test rejecting a join request"""
        # User2 submits join request
        join_response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "Let me join!"}
        )
        request_id = join_response.get_json()["id"]

        # Owner rejects the request
        response = client.post(
            f"/events/{event.id}/join-requests/{request_id}/review",
            headers=auth_headers,
            json={"action": "reject"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "rejected"

    def test_review_join_request_invalid_action(self, client, db, user, user2, event, auth_headers, auth_headers_user2):
        """Test reviewing with invalid action"""
        # User2 submits join request
        join_response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "Let me join!"}
        )
        request_id = join_response.get_json()["id"]

        response = client.post(
            f"/events/{event.id}/join-requests/{request_id}/review",
            headers=auth_headers,
            json={"action": "invalid"}
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "invalid_action"

    def test_review_join_request_not_owner(self, client, db, user, user2, event, auth_headers, auth_headers_user2):
        """Test reviewing join request as non-owner fails"""
        # User2 submits join request
        join_response = client.post(f"/events/{event.id}/join",
            headers=auth_headers_user2,
            json={"message": "Let me join!"}
        )
        request_id = join_response.get_json()["id"]

        # User2 tries to review their own request
        response = client.post(
            f"/events/{event.id}/join-requests/{request_id}/review",
            headers=auth_headers_user2,
            json={"action": "approve"}
        )
        assert response.status_code == 403

    def test_review_join_request_no_auth(self, client, db, event):
        """Test reviewing join request without authentication fails"""
        import uuid
        fake_request_id = uuid.uuid4()
        response = client.post(
            f"/events/{event.id}/join-requests/{fake_request_id}/review",
            json={"action": "approve"}
        )
        assert response.status_code == 401

    def test_review_join_request_not_found(self, client, db, user, event, auth_headers):
        """Test reviewing non-existent join request"""
        import uuid
        fake_request_id = uuid.uuid4()
        response = client.post(
            f"/events/{event.id}/join-requests/{fake_request_id}/review",
            headers=auth_headers,
            json={"action": "approve"}
        )
        assert response.status_code == 404
