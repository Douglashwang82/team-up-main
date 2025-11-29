import pytest
from datetime import date, timedelta


class TestCreateTicket:
    """Tests for creating tickets"""

    def test_create_ticket_success(self, client, db, user, auth_headers):
        """Test creating a ticket successfully"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        response = client.post("/tickets", headers=auth_headers, json={
            "date": tomorrow,
            "start_time": "18:00",
            "duration_minutes": 60,
            "sport_type": "basketball",
            "intensity": "Medium"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["status"] == "open"
        assert "message" in data

    def test_create_ticket_with_optional_fields(self, client, db, user, auth_headers):
        """Test creating ticket with optional fields"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        response = client.post("/tickets", headers=auth_headers, json={
            "date": tomorrow,
            "start_time": "18:00",
            "duration_minutes": 60,
            "sport_type": "tennis",
            "intensity": "High",
            "price_min": 2000,
            "price_max": 5000,
            "currency": "USD",
            "venue_ids": []
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "id" in data
        assert data["status"] == "open"

    def test_create_ticket_missing_required_fields(self, client, db, user, auth_headers):
        """Test creating ticket with missing required fields"""
        response = client.post("/tickets", headers=auth_headers, json={
            "date": "2025-12-01",
            "sport_type": "basketball"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert data["error"] == "missing_fields"
        assert "fields" in data

    def test_create_ticket_no_auth(self, client, db):
        """Test creating ticket without authentication fails"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        response = client.post("/tickets", json={
            "date": tomorrow,
            "start_time": "18:00",
            "duration_minutes": 60,
            "sport_type": "basketball",
            "intensity": "Medium"
        })
        assert response.status_code == 401

    def test_create_ticket_invalid_date_format(self, client, db, user, auth_headers):
        """Test creating ticket with invalid date format"""
        response = client.post("/tickets", headers=auth_headers, json={
            "date": "invalid-date",
            "start_time": "18:00",
            "duration_minutes": 60,
            "sport_type": "basketball",
            "intensity": "Medium"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_create_ticket_invalid_time_format(self, client, db, user, auth_headers):
        """Test creating ticket with invalid time format"""
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        response = client.post("/tickets", headers=auth_headers, json={
            "date": tomorrow,
            "start_time": "invalid-time",
            "duration_minutes": 60,
            "sport_type": "basketball",
            "intensity": "Medium"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_create_ticket_iso_datetime(self, client, db, user, auth_headers):
        """Test creating ticket with ISO datetime format"""
        from datetime import datetime
        tomorrow_dt = datetime.now() + timedelta(days=1)
        iso_date = tomorrow_dt.isoformat()
        response = client.post("/tickets", headers=auth_headers, json={
            "date": iso_date,
            "start_time": "18:00:00",
            "duration_minutes": 60,
            "sport_type": "basketball",
            "intensity": "Medium"
        })
        assert response.status_code == 201


class TestGetTickets:
    """Tests for listing tickets"""

    def test_get_tickets_success(self, client, db, user, ticket, auth_headers):
        """Test getting user's tickets"""
        response = client.get("/tickets", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "id" in data[0]
        assert "date" in data[0]
        assert "start_time" in data[0]
        assert "sport_type" in data[0]
        assert "status" in data[0]

    def test_get_tickets_no_auth(self, client, db):
        """Test getting tickets without authentication fails"""
        response = client.get("/tickets")
        assert response.status_code == 401

    def test_get_tickets_empty_list(self, client, db, user, auth_headers):
        """Test getting tickets when user has no tickets"""
        response = client.get("/tickets", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_tickets_only_user_tickets(self, client, db, user, user2, ticket, auth_headers, auth_headers_user2):
        """Test that users only see their own tickets"""
        # Create ticket for user2
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        client.post("/tickets", headers=auth_headers_user2, json={
            "date": tomorrow,
            "start_time": "18:00",
            "duration_minutes": 60,
            "sport_type": "tennis",
            "intensity": "High"
        })

        # User should only see their own ticket
        response = client.get("/tickets", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        # User has 1 ticket from the fixture
        assert len(data) == 1
        assert data[0]["sport_type"] == "basketball"

    def test_get_tickets_ordered_by_created_at(self, client, db, user, auth_headers):
        """Test tickets are ordered by creation date (newest first)"""
        # Create multiple tickets
        for i in range(3):
            tomorrow = (date.today() + timedelta(days=i+1)).isoformat()
            client.post("/tickets", headers=auth_headers, json={
                "date": tomorrow,
                "start_time": "18:00",
                "duration_minutes": 60,
                "sport_type": "basketball",
                "intensity": "Medium"
            })

        response = client.get("/tickets", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) >= 3

        # Verify ordering (newest first)
        from datetime import datetime
        for i in range(len(data) - 1):
            created_1 = datetime.fromisoformat(data[i]["created_at"])
            created_2 = datetime.fromisoformat(data[i+1]["created_at"])
            assert created_1 >= created_2
