"""Tests for the matchmaking endpoint"""
import pytest
from app.models.user import User


class TestMatchmaking:
    """Tests for GET /user/matchmaking"""

    def test_matchmaking_returns_matched_users(self, client, db, user, user2, auth_headers):
        """Users with shared sports should appear in results"""
        # Set skill profiles
        user.preferred_sports = ["basketball", "badminton"]
        user.skill_levels = {"basketball": "intermediate", "badminton": "beginner"}

        user2.preferred_sports = ["basketball"]
        user2.skill_levels = {"basketball": "intermediate"}
        db.commit()

        resp = client.get("/user/matchmaking", headers=auth_headers)
        assert resp.status_code == 200

        data = resp.get_json()
        assert len(data) >= 1

        # user2 should be in results with basketball as shared sport
        match = next((m for m in data if m["user"]["id"] == str(user2.id)), None)
        assert match is not None
        assert "basketball" in match["shared_sports"]
        assert match["skill_compatibility"]["basketball"] == "exact"
        assert match["match_score"] == 6  # 3 (shared sport) + 3 (exact skill)

    def test_matchmaking_no_sports_returns_empty(self, client, db, user, auth_headers):
        """User with no preferred_sports should get empty list"""
        user.preferred_sports = None
        db.commit()

        resp = client.get("/user/matchmaking", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []

    def test_matchmaking_adjacent_skill(self, client, db, user, user2, auth_headers):
        """Adjacent skill levels should get +1 bonus"""
        user.preferred_sports = ["badminton"]
        user.skill_levels = {"badminton": "intermediate"}

        user2.preferred_sports = ["badminton"]
        user2.skill_levels = {"badminton": "advanced"}
        db.commit()

        resp = client.get("/user/matchmaking", headers=auth_headers)
        data = resp.get_json()

        match = next((m for m in data if m["user"]["id"] == str(user2.id)), None)
        assert match is not None
        assert match["skill_compatibility"]["badminton"] == "close"
        assert match["match_score"] == 4  # 3 (shared) + 1 (adjacent)

    def test_matchmaking_no_overlap(self, client, db, user, user2, auth_headers):
        """Users with no shared sports should not appear"""
        user.preferred_sports = ["tennis"]
        user.skill_levels = {"tennis": "beginner"}

        user2.preferred_sports = ["basketball"]
        user2.skill_levels = {"basketball": "advanced"}
        db.commit()

        resp = client.get("/user/matchmaking", headers=auth_headers)
        data = resp.get_json()

        match = next((m for m in data if m["user"]["id"] == str(user2.id)), None)
        assert match is None

    def test_matchmaking_excludes_self(self, client, db, user, auth_headers):
        """Current user should never appear in their own results"""
        user.preferred_sports = ["basketball"]
        user.skill_levels = {"basketball": "intermediate"}
        db.commit()

        resp = client.get("/user/matchmaking", headers=auth_headers)
        data = resp.get_json()

        self_match = next((m for m in data if m["user"]["id"] == str(user.id)), None)
        assert self_match is None
