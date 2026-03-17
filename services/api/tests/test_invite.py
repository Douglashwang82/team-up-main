"""Tests for the invite endpoint"""
import pytest


class TestInviteUser:
    """Tests for POST /events/{id}/invite"""

    def test_invite_success(self, client, db, event, user2, auth_headers):
        """Owner can invite a user to their event"""
        resp = client.post(
            f"/events/{event.id}/invite",
            json={"user_id": str(user2.id)},
            headers=auth_headers,
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["ok"] is True
        assert "participant_id" in data

    def test_invite_duplicate(self, client, db, event, user2, auth_headers):
        """Cannot invite the same user twice"""
        client.post(
            f"/events/{event.id}/invite",
            json={"user_id": str(user2.id)},
            headers=auth_headers,
        )
        resp = client.post(
            f"/events/{event.id}/invite",
            json={"user_id": str(user2.id)},
            headers=auth_headers,
        )
        assert resp.status_code == 400
        assert resp.get_json()["error"] == "already_joined"

    def test_invite_not_owner(self, client, db, event, user2, auth_headers_user2):
        """Non-owner cannot invite"""
        resp = client.post(
            f"/events/{event.id}/invite",
            json={"user_id": str(user2.id)},
            headers=auth_headers_user2,
        )
        assert resp.status_code == 403

    def test_invite_creates_notification(self, client, db, event, user2, auth_headers):
        """Invite should create a notification for the invitee"""
        from app.models.notification import Notification

        client.post(
            f"/events/{event.id}/invite",
            json={"user_id": str(user2.id)},
            headers=auth_headers,
        )
        notif = db.query(Notification).filter(
            Notification.user_id == user2.id,
            Notification.type == "event_invite",
        ).first()
        assert notif is not None
        assert event.title in notif.message


class TestOwnedEvents:
    """Tests for GET /events/owned"""

    def test_owned_events(self, client, db, event, auth_headers):
        """Should return events owned by the current user"""
        resp = client.get("/events/owned", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data) >= 1
        assert data[0]["id"] == str(event.id)
        assert "participant_count" in data[0]
