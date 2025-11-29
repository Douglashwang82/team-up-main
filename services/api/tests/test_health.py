import pytest


def test_health_check(client):
    """Test health check endpoint returns ok status"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "ok"
