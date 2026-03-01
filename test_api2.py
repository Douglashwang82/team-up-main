import urllib.request
import urllib.error
import json
import ssl

BASE_URL = "http://localhost:8080"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def do_req(url, data=None, headers=None):
    if headers is None: headers = {}
    if data:
        data = json.dumps(data).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        res = urllib.request.urlopen(req, context=ctx)
        return json.loads(res.read())
    except urllib.error.HTTPError as e:
        if e.code == 400 or e.code == 401 or e.code == 403 or e.code == 404:
            return None
        raise e

# Register or login
data = do_req(f"{BASE_URL}/auth/register", {
    "email": "test_user_payload3@example.com",
    "password": "password123",
    "display_name": "Test User Payload"
})
if not data:
    data = do_req(f"{BASE_URL}/auth/login", {
        "email": "test_user_payload3@example.com",
        "password": "password123"
    })

token = data.get("access_token")

# Get events
events = do_req(f"{BASE_URL}/events", headers={"Authorization": f"Bearer {token}"})

print("Found", len(events), "events.")
if len(events) > 0:
    for event in events[:3]:
        print(f"ID: {event['id']}, Title: {event['title']}, user_join_status: {event.get('user_join_status')}")
