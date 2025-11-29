import pytest
import jwt
from datetime import datetime, timedelta


class TestSignup:
    """Tests for user signup"""

    def test_signup_success(self, client, db):
        """Test successful user signup"""
        response = client.post("/auth/signup", json={
            "email": "newuser@example.com",
            "password": "password123",
            "display_name": "New User"
        })
        assert response.status_code == 201
        data = response.get_json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_signup_duplicate_email(self, client, db, user):
        """Test signup with existing email fails"""
        response = client.post("/auth/signup", json={
            "email": user.email,
            "password": "password123",
            "display_name": "Duplicate User"
        })
        assert response.status_code == 409
        data = response.get_json()
        assert data["error"] == "email_taken"

    def test_signup_missing_fields(self, client, db):
        """Test signup with missing required fields fails"""
        response = client.post("/auth/signup", json={
            "email": "incomplete@example.com"
        })
        assert response.status_code in [400, 422]


class TestLogin:
    """Tests for user login"""

    def test_login_success(self, client, db, user):
        """Test successful login"""
        response = client.post("/auth/login", json={
            "email": user.email,
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.get_json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_invalid_email(self, client, db):
        """Test login with non-existent email fails"""
        response = client.post("/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })
        assert response.status_code == 401
        data = response.get_json()
        assert data["error"] == "invalid_credentials"

    def test_login_invalid_password(self, client, db, user):
        """Test login with wrong password fails"""
        response = client.post("/auth/login", json={
            "email": user.email,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.get_json()
        assert data["error"] == "invalid_credentials"


class TestRefresh:
    """Tests for token refresh"""

    def test_refresh_success(self, client, app, user):
        """Test successful token refresh"""
        refresh_token = jwt.encode(
            {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(hours=24)},
            app.config["JWT_SECRET"],
            algorithm="HS256"
        )
        response = client.post("/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert response.status_code == 200
        data = response.get_json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        """Test refresh with invalid token fails"""
        response = client.post("/auth/refresh", json={
            "refresh_token": "invalid_token"
        })
        assert response.status_code == 401
        data = response.get_json()
        assert data["error"] == "invalid_token"

    def test_refresh_expired_token(self, client, app, user):
        """Test refresh with expired token fails"""
        expired_token = jwt.encode(
            {"sub": str(user.id), "exp": datetime.utcnow() - timedelta(hours=1)},
            app.config["JWT_SECRET"],
            algorithm="HS256"
        )
        response = client.post("/auth/refresh", json={
            "refresh_token": expired_token
        })
        assert response.status_code == 401


class TestGetMe:
    """Tests for getting current user info"""

    def test_get_me_success(self, client, user, auth_headers):
        """Test getting current user info"""
        response = client.get("/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.get_json()
        assert data["email"] == user.email
        assert data["display_name"] == user.display_name
        assert "id" in data

    def test_get_me_no_auth(self, client):
        """Test getting user info without authentication fails"""
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token(self, client):
        """Test getting user info with invalid token fails"""
        response = client.get("/auth/me", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401


class TestUpdateMe:
    """Tests for updating current user info"""

    def test_update_me_success(self, client, user, auth_headers):
        """Test updating current user display name"""
        response = client.patch("/auth/me",
            headers=auth_headers,
            json={"display_name": "Updated Name"}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["display_name"] == "Updated Name"
        assert data["email"] == user.email

    def test_update_me_no_auth(self, client):
        """Test updating user without authentication fails"""
        response = client.patch("/auth/me", json={
            "display_name": "Updated Name"
        })
        assert response.status_code == 401

    def test_update_me_empty_body(self, client, user, auth_headers):
        """Test updating with empty body returns current user info"""
        response = client.patch("/auth/me",
            headers=auth_headers,
            json={}
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["display_name"] == user.display_name
