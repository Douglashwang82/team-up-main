import pytest
from datetime import datetime, timedelta


class TestGetVenues:
    """Tests for listing venues"""

    def test_get_venues_success(self, client, db, venue):
        """Test getting all venues"""
        response = client.get("/venues")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "venue" in data[0]
        assert "time_slots" in data[0]

    def test_get_venues_with_location(self, client, db, venue):
        """Test getting venues with geolocation filter"""
        response = client.get("/venues", query_string={
            "lat": 25.0330,
            "lng": 121.5654,
            "distance": 5000
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "distance_meters" in data[0]

    def test_get_venues_with_sport_type(self, client, db, venue):
        """Test filtering venues by sport type"""
        response = client.get("/venues", query_string={
            "sport_type": "basketball"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_get_venues_with_date(self, client, db, venue):
        """Test filtering venues by date"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        response = client.get("/venues", query_string={
            "datetime": tomorrow
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_get_venues_with_datetime(self, client, db, venue):
        """Test filtering venues by datetime"""
        tomorrow = (datetime.now() + timedelta(days=1)).replace(hour=12, minute=0)
        datetime_str = tomorrow.isoformat()
        response = client.get("/venues", query_string={
            "datetime": datetime_str
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_get_venues_invalid_coordinates(self, client, db):
        """Test venues search with invalid coordinates"""
        response = client.get("/venues", query_string={
            "lat": "invalid",
            "lng": "invalid"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_get_venues_invalid_datetime(self, client, db):
        """Test venues search with invalid datetime format"""
        response = client.get("/venues", query_string={
            "datetime": "invalid-date"
        })
        assert response.status_code == 400
        data = response.get_json()
        assert "error" in data

    def test_get_venues_combined_filters(self, client, db, venue):
        """Test venues search with multiple filters"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        response = client.get("/venues", query_string={
            "lat": 25.0330,
            "lng": 121.5654,
            "distance": 10000,
            "sport_type": "basketball",
            "datetime": tomorrow
        })
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)


class TestGetVenueById:
    """Tests for getting venue by ID"""

    def test_get_venue_by_id_success(self, client, db, venue):
        """Test getting venue details by ID"""
        response = client.get(f"/venues/{venue.id}")
        assert response.status_code == 200
        data = response.get_json()
        assert "venue" in data
        assert "courts" in data
        assert data["venue"]["name"] == venue.name
        assert isinstance(data["courts"], list)

    def test_get_venue_by_id_not_found(self, client, db):
        """Test getting non-existent venue"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.get(f"/venues/{fake_id}")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data


class TestGetCourtTimeSlots:
    """Tests for getting court time slots"""

    def test_get_court_time_slots_success(self, client, db, venue):
        """Test getting time slots for a court"""
        from app.models.venue import Court
        court = db.query(Court).filter(Court.venue_id == venue.id).first()
        assert court is not None

        response = client.get(f"/venues/{venue.id}/courts/{court.id}/time_slots")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "id" in data[0]
            assert "starts_at" in data[0]
            assert "ends_at" in data[0]
            assert "price_cents" in data[0]
            assert "is_bookable" in data[0]

    def test_get_court_time_slots_with_date(self, client, db, venue):
        """Test getting time slots filtered by date"""
        from app.models.venue import Court
        court = db.query(Court).filter(Court.venue_id == venue.id).first()
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        response = client.get(
            f"/venues/{venue.id}/courts/{court.id}/time_slots",
            query_string={"date": tomorrow}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)

    def test_get_court_time_slots_invalid_date(self, client, db, venue):
        """Test time slots with invalid date format"""
        from app.models.venue import Court
        court = db.query(Court).filter(Court.venue_id == venue.id).first()

        response = client.get(
            f"/venues/{venue.id}/courts/{court.id}/time_slots",
            query_string={"date": "invalid-date"}
        )
        assert response.status_code == 400

    def test_get_court_time_slots_wrong_venue(self, client, db, venue):
        """Test getting time slots with mismatched venue and court IDs"""
        import uuid
        fake_court_id = uuid.uuid4()

        response = client.get(f"/venues/{venue.id}/courts/{fake_court_id}/time_slots")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data

    def test_get_court_time_slots_not_found(self, client, db):
        """Test getting time slots for non-existent venue and court"""
        import uuid
        fake_venue_id = uuid.uuid4()
        fake_court_id = uuid.uuid4()

        response = client.get(f"/venues/{fake_venue_id}/courts/{fake_court_id}/time_slots")
        assert response.status_code == 404
