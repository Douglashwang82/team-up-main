import urllib.request
import urllib.error
import urllib.parse
import json

BASE_URL = "http://localhost:8080"

# Register or login
try:
    req = urllib.request.Request(f"{BASE_URL}/auth/register", data=json.dumps({
        "email": "test_user_payload@example.com",
        "password": "password123",
        "display_name": "Test User Payload"
    }).encode(), headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
except urllib.error.HTTPError as e:
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=json.dumps({
        "email": "test_user_payload@example.com",
        "password": "password123"
    }).encode(), headers={"Content-Type": "application/json"})
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())

token = data.get("access_token")

# Get events
req = urllib.request.Request(f"{BASE_URL}/events", headers={"Authorization": f"Bearer {token}"})
res = urllib.request.urlopen(req)
events = json.loads(res.read())

print("Found", len(events), "events.")
if len(events) > 0:
    for event in events[:3]:
        print(f"ID: {event['id']}, Title: {event['title']}, user_join_status: {event.get('user_join_status')}")
