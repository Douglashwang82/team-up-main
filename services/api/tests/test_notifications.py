import pytest
from app.models import Notification


class TestGetNotifications:
    """Tests for getting notifications"""

    def test_get_notifications_success(self, client, db, user, notification, auth_headers):
        """Test getting user's notifications"""
        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "id" in data[0]
        assert "message" in data[0]
        assert "type" in data[0]
        assert "is_read" in data[0]
        assert "related_event_ids" in data[0]
        assert "created_at" in data[0]

    def test_get_notifications_no_auth(self, client, db):
        """Test getting notifications without authentication fails"""
        response = client.get("/notifications")
        assert response.status_code == 401
        data = response.get_json()
        assert data["error"] == "unauthorized"

    def test_get_notifications_empty_list(self, client, db, user, auth_headers):
        """Test getting notifications when user has none"""
        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_get_notifications_only_user_notifications(self, client, db, user, user2, notification, auth_headers):
        """Test users only see their own notifications"""
        # Create notification for user2
        notif2 = Notification(
            user_id=user2.id,
            message="User2 notification",
            type="general",
            is_read=False,
            related_event_ids=[]
        )
        db.add(notif2)
        db.commit()

        # User should only see their own notification
        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) == 1
        assert data[0]["message"] == "Test notification"

    def test_get_notifications_ordered_by_created_at(self, client, db, user, auth_headers):
        """Test notifications are ordered by creation date (newest first)"""
        # Create multiple notifications
        for i in range(3):
            notif = Notification(
                user_id=user.id,
                message=f"Notification {i}",
                type="general",
                is_read=False,
                related_event_ids=[]
            )
            db.add(notif)
        db.commit()

        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert len(data) >= 3

        # Verify ordering (newest first)
        from datetime import datetime
        for i in range(len(data) - 1):
            created_1 = datetime.fromisoformat(data[i]["created_at"])
            created_2 = datetime.fromisoformat(data[i+1]["created_at"])
            assert created_1 >= created_2

    def test_get_notifications_with_event_ids(self, client, db, user, event, auth_headers):
        """Test notification with related event IDs"""
        notif = Notification(
            user_id=user.id,
            message="Match found",
            type="match_found",
            is_read=False,
            related_event_ids=[event.id]
        )
        db.add(notif)
        db.commit()

        response = client.get("/notifications", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()

        # Find the match_found notification
        match_notif = next((n for n in data if n["type"] == "match_found"), None)
        assert match_notif is not None
        assert len(match_notif["related_event_ids"]) == 1
        assert match_notif["related_event_ids"][0] == str(event.id)


class TestMarkNotificationAsRead:
    """Tests for marking notifications as read"""

    def test_mark_notification_as_read_success(self, client, db, user, notification, auth_headers):
        """Test marking notification as read"""
        response = client.post(f"/notifications/{notification.id}/read",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.get_json()
        assert "message" in data

        # Verify notification is marked as read
        db.refresh(notification)
        assert notification.is_read is True

    def test_mark_notification_as_read_no_auth(self, client, db, notification):
        """Test marking notification as read without authentication fails"""
        response = client.post(f"/notifications/{notification.id}/read")
        assert response.status_code == 401
        data = response.get_json()
        assert data["error"] == "unauthorized"

    def test_mark_notification_as_read_not_owner(self, client, db, notification, auth_headers_user2):
        """Test marking notification that doesn't belong to user"""
        response = client.post(f"/notifications/{notification.id}/read",
            headers=auth_headers_user2
        )
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "notification_not_found"

    def test_mark_notification_as_read_not_found(self, client, db, user, auth_headers):
        """Test marking non-existent notification as read"""
        import uuid
        fake_id = uuid.uuid4()
        response = client.post(f"/notifications/{fake_id}/read",
            headers=auth_headers
        )
        assert response.status_code == 404
        data = response.get_json()
        assert data["error"] == "notification_not_found"

    def test_mark_notification_as_read_idempotent(self, client, db, user, notification, auth_headers):
        """Test marking already read notification as read again"""
        # Mark as read first time
        client.post(f"/notifications/{notification.id}/read", headers=auth_headers)

        # Mark as read second time
        response = client.post(f"/notifications/{notification.id}/read",
            headers=auth_headers
        )
        assert response.status_code == 200

        # Verify still marked as read
        db.refresh(notification)
        assert notification.is_read is True
