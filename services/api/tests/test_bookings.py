import pytest
from app.models.venue import TimeSlot, Court


class TestCreateBooking:
    """Tests for creating bookings"""

    def test_create_booking_success(self, client, db, user, venue, auth_headers):
        """Test creating a booking successfully"""
        time_slot = db.query(TimeSlot).filter(TimeSlot.court_id.in_(
            db.query(Court.id).filter(Court.venue_id == venue.id)
        )).first()

        response = client.post("/bookings", headers=auth_headers, json={
            "time_slot_id": str(time_slot.id)
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["time_slot_id"] == str(time_slot.id)
        assert data["owner_user_id"] == str(user.id)
        assert data["status"] == "pending"
        assert data["payment_status"] == "none"

    def test_create_booking_no_auth(self, client, db, venue):
        """Test creating booking without authentication fails"""
        time_slot = db.query(TimeSlot).first()
        response = client.post("/bookings", json={
            "time_slot_id": str(time_slot.id)
        })
        assert response.status_code == 401

    def test_create_booking_missing_time_slot_id(self, client, db, user, auth_headers):
        """Test creating booking without time_slot_id fails"""
        response = client.post("/bookings", headers=auth_headers, json={})
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "time_slot_id_required"

    def test_create_booking_invalid_time_slot_id(self, client, db, user, auth_headers):
        """Test creating booking with invalid time_slot_id"""
        response = client.post("/bookings", headers=auth_headers, json={
            "time_slot_id": "invalid-uuid"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "invalid_time_slot_id"

    def test_create_booking_nonexistent_time_slot(self, client, db, user, auth_headers):
        """Test creating booking with non-existent time slot"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.post("/bookings", headers=auth_headers, json={
            "time_slot_id": str(fake_id)
        })
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "time_slot_not_found"

    def test_create_booking_already_booked(self, client, db, user, booking, auth_headers):
        """Test creating booking for already booked time slot"""
        response = client.post("/bookings", headers=auth_headers, json={
            "time_slot_id": str(booking.time_slot_id)
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "time_slot_already_booked"

    def test_create_booking_with_event_id(self, client, db, user, venue, event, auth_headers):
        """Test creating booking associated with an event"""
        # Get an unboked time slot
        time_slots = db.query(TimeSlot).filter(TimeSlot.court_id.in_(
            db.query(Court.id).filter(Court.venue_id == venue.id)
        )).all()
        time_slot = time_slots[1]  # Get second slot

        response = client.post("/bookings", headers=auth_headers, json={
            "time_slot_id": str(time_slot.id),
            "event_id": str(event.id)
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data["event_id"] == str(event.id)


class TestListBookings:
    """Tests for listing bookings"""

    def test_list_bookings_success(self, client, db, user, booking, auth_headers):
        """Test listing user's bookings"""
        response = client.get("/bookings", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["id"] == str(booking.id)

    def test_list_bookings_no_auth(self, client, db):
        """Test listing bookings without authentication fails"""
        response = client.get("/bookings")
        assert response.status_code == 401

    def test_list_bookings_filter_by_status(self, client, db, user, booking, auth_headers):
        """Test filtering bookings by status"""
        response = client.get("/bookings",
            headers=auth_headers,
            query_string={"status": "pending"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        for booking_data in data:
            assert booking_data["status"] == "pending"

    def test_list_bookings_pagination(self, client, db, user, venue, auth_headers):
        """Test bookings pagination"""
        # Create multiple bookings
        time_slots = db.query(TimeSlot).filter(TimeSlot.court_id.in_(
            db.query(Court.id).filter(Court.venue_id == venue.id)
        )).limit(3).all()

        for ts in time_slots:
            client.post("/bookings", headers=auth_headers, json={
                "time_slot_id": str(ts.id)
            })

        # Test with limit
        response = client.get("/bookings",
            headers=auth_headers,
            query_string={"limit": 2, "offset": 0}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) <= 2

        # Test with offset
        response = client.get("/bookings",
            headers=auth_headers,
            query_string={"limit": 2, "offset": 1}
        )
        assert response.status_code == 200

    def test_list_bookings_empty(self, client, db, user, auth_headers):
        """Test listing bookings when user has none"""
        response = client.get("/bookings", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0


class TestGetBookingById:
    """Tests for getting booking by ID"""

    def test_get_booking_success(self, client, db, user, booking, auth_headers):
        """Test getting booking details"""
        response = client.get(f"/bookings/{booking.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["id"] == str(booking.id)
        assert "time_slot" in data
        assert "court" in data
        assert "venue" in data

    def test_get_booking_no_auth(self, client, db, booking):
        """Test getting booking without authentication fails"""
        response = client.get(f"/bookings/{booking.id}")
        assert response.status_code == 401

    def test_get_booking_not_owner(self, client, db, booking, auth_headers_user2):
        """Test getting booking that doesn't belong to user"""
        response = client.get(f"/bookings/{booking.id}", headers=auth_headers_user2)
        assert response.status_code == 403
        data = response.get_json()
        assert data["error"] == "not_owner"

    def test_get_booking_not_found(self, client, db, user, auth_headers):
        """Test getting non-existent booking"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/bookings/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "booking_not_found"


class TestUpdateBooking:
    """Tests for updating bookings"""

    def test_update_booking_status(self, client, db, user, booking, auth_headers):
        """Test updating booking status"""
        response = client.patch(f"/bookings/{booking.id}",
            headers=auth_headers,
            json={"status": "confirmed"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "confirmed"

    def test_update_booking_payment_status(self, client, db, user, booking, auth_headers):
        """Test updating booking payment status"""
        response = client.patch(f"/bookings/{booking.id}",
            headers=auth_headers,
            json={"payment_status": "succeeded"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["payment_status"] == "succeeded"

    def test_update_booking_both_statuses(self, client, db, user, booking, auth_headers):
        """Test updating both status and payment_status"""
        response = client.patch(f"/bookings/{booking.id}",
            headers=auth_headers,
            json={
                "status": "confirmed",
                "payment_status": "succeeded"
            }
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "confirmed"
        assert data["payment_status"] == "succeeded"

    def test_update_booking_no_auth(self, client, db, booking):
        """Test updating booking without authentication fails"""
        response = client.patch(f"/bookings/{booking.id}", json={
            "status": "confirmed"
        })
        assert response.status_code == 401

    def test_update_booking_not_owner(self, client, db, booking, auth_headers_user2):
        """Test updating booking that doesn't belong to user"""
        response = client.patch(f"/bookings/{booking.id}",
            headers=auth_headers_user2,
            json={"status": "confirmed"}
        )
        assert response.status_code == 403
        data = response.get_json()
        assert data["error"] == "not_owner"

    def test_update_booking_not_found(self, client, db, user, auth_headers):
        """Test updating non-existent booking"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.patch(f"/bookings/{fake_id}",
            headers=auth_headers,
            json={"status": "confirmed"}
        )
        assert response.status_code == 404


class TestCancelBooking:
    """Tests for cancelling bookings"""

    def test_cancel_booking_success(self, client, db, user, booking, auth_headers):
        """Test cancelling a booking"""
        response = client.delete(f"/bookings/{booking.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["ok"] is True
        assert "message" in data

        # Verify booking status is cancelled
        from app.models.booking import Booking
        db.expire_all()  # Expire cached objects to see committed changes
        cancelled_booking = db.query(Booking).filter(Booking.id == booking.id).first()
        assert cancelled_booking.status == "cancelled"

    def test_cancel_booking_no_auth(self, client, db, booking):
        """Test cancelling booking without authentication fails"""
        response = client.delete(f"/bookings/{booking.id}")
        assert response.status_code == 401

    def test_cancel_booking_not_owner(self, client, db, booking, auth_headers_user2):
        """Test cancelling booking that doesn't belong to user"""
        response = client.delete(f"/bookings/{booking.id}", headers=auth_headers_user2)
        assert response.status_code == 403
        data = response.get_json()
        assert data["error"] == "not_owner"

    def test_cancel_booking_not_found(self, client, db, user, auth_headers):
        """Test cancelling non-existent booking"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.delete(f"/bookings/{fake_id}", headers=auth_headers)
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "booking_not_found"
