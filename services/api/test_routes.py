#!/usr/bin/env python3
"""
Comprehensive route testing script for Event API
Tests all endpoints with seeded data
"""
import requests
import json
from datetime import datetime, timedelta

# API base URL - adjust if needed
BASE_URL = "http://localhost:8080"

# Test credentials from seed data
TEST_USERS = {
    "alice": {"email": "alice@example.com", "password": "password123"},
    "bob": {"email": "bob@example.com", "password": "password123"},
    "charlie": {"email": "charlie@example.com", "password": "password123"},
}

# Store tokens and IDs
auth_tokens = {}
test_data = {}

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_sub_section(title):
    print("-" * 60)
    print(f"  {title}")
    print("-" * 60)

def print_test(name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} | {name}")
    if details:
        print(f"      {details}")

def make_request(method, endpoint, **kwargs):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.request(method, url, **kwargs)
        return response
    except requests.exceptions.ConnectionError:
        print(f"❌ ERROR: Could not connect to {BASE_URL}")
        print("   Make sure your API server is running!")
        exit(1)
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return None

# =============================================================================
# AUTHENTICATION TESTS
# =============================================================================
def test_auth():
    print_section("1. AUTHENTICATION ROUTES")

    # Test 1.1: Login
    for name, creds in TEST_USERS.items():
        response = make_request("POST", "/auth/login", json=creds)
        passed = response.status_code == 200

        if passed:
            data = response.json()
            auth_tokens[name] = data.get("access_token")
            print_test(f"Login as {name}", True, f"Token: {auth_tokens[name][:20]}...")
        else:
            print_test(f"Login as {name}", False, f"Status: {response.status_code}")

    # Test 1.2: Signup (new user)
    new_user = {
        "email": "test_user@example.com",
        "password": "testpass123",
        "display_name": "Test User"
    }
    response = make_request("POST", "/auth/signup", json=new_user)
    passed = response.status_code in [200, 201]
    print_test("Signup new user", passed, f"Status: {response.status_code}")

# =============================================================================
# VENUE ROUTES
# =============================================================================
def test_venues():
    print_section("2. VENUE ROUTES")

    # Test 2.1: Search venues (no filters)
    response = make_request("GET", "/venues")
    passed = response.status_code == 200
    if passed:
        venues = response.json()
        test_data['venues'] = venues
        print_test("Get all venues", True, f"Found {len(venues)} venues")
    else:
        print_test("Get all venues", False, f"Status: {response.status_code}")

    # Test 2.2: Search with geolocation (Taipei city center)
    params = {
        "lat": 25.0330,
        "lng": 121.5654,
        "distance": 5000,  # 5km
        "sport_type": "basketball"
    }
    response = make_request("GET", "/venues", params=params)
    passed = response.status_code == 200
    if passed:
        venues = response.json()
        print_test("Search venues by location + sport", True,
                  f"Found {len(venues)} basketball venues within 5km")
    else:
        print_test("Search venues by location + sport", False, f"Status: {response.status_code}")

    # Test 2.3: Search with datetime filter
    tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    params = {"datetime": tomorrow}
    response = make_request("GET", "/venues", params=params)
    passed = response.status_code == 200
    if passed:
        venues = response.json()
        print_test("Search venues by date", True, f"Found {len(venues)} venues with slots tomorrow")
    else:
        print_test("Search venues by date", False, f"Status: {response.status_code}")

    # Test 2.4: Get specific venue
    if test_data.get('venues'):
        venue_id = test_data['venues'][0]['venue']['id']
        response = make_request("GET", f"/venues/{venue_id}")
        passed = response.status_code == 200
        if passed:
            venue = response.json()
            test_data['venue_detail'] = venue
            print_test("Get venue by ID", True, f"Venue: {venue.get('venue', {}).get('name')}")
        else:
            print_test("Get venue by ID", False, f"Status: {response.status_code}")

    # Test 2.5: Get court time slots
    if test_data.get('venue_detail'):
        venue_id = test_data['venue_detail']['venue']['id']
        court_id = test_data['venue_detail']['courts'][0]['id']
        response = make_request("GET", f"/venues/{venue_id}/courts/{court_id}/time_slots")
        passed = response.status_code == 200
        if passed:
            time_slots = response.json()
            test_data['time_slots'] = time_slots
            print_test("Get court time slots", True, f"Found {len(time_slots)} time slots")
        else:
            print_test("Get court time slots", False, f"Status: {response.status_code}")

    # Test 2.6: Detailed Court Operations
    if test_data.get('venue_detail'):
        print_sub_section("Detailed Court & TimeSlot Ops")
        venue_id = test_data['venue_detail']['venue']['id']
        court_id = test_data['venue_detail']['courts'][0]['id']
        
        # Get single court
        response = make_request("GET", f"/venues/{venue_id}/courts/{court_id}")
        passed = response.status_code == 200
        print_test("Get single court", passed, f"Status: {response.status_code}")

        # Update court (we won't actually change values to avoid breaking things, or just update safely)
        # Assuming we can update fields safely. Let's just PUT with same data for test.
        court_data = response.json() if passed else {}
        if court_data:
             update_data = {"name": court_data["name"] + " (Updated)"}
             response = make_request("PUT", f"/venues/{venue_id}/courts/{court_id}", json=update_data)
             passed = response.status_code == 200
             print_test("Update court", passed, f"New Name: {response.json().get('name')}" if passed else "")

             # Revert name
             make_request("PUT", f"/venues/{venue_id}/courts/{court_id}", json={"name": court_data["name"]})

        # Test 2.7: Single TimeSlot Ops
        if test_data.get('time_slots') and len(test_data['time_slots']) > 0:
            ts_id = test_data['time_slots'][0]['id']
            # Get single time slot
            response = make_request("GET", f"/venues/{venue_id}/courts/{court_id}/time_slots/{ts_id}")
            passed = response.status_code == 200
            print_test("Get single time slot", passed, f"Status: {response.status_code}")
            
            # Update time slot
            if passed:
                ts_data = response.json()
                update_payload = {"price_cents": (ts_data.get("price_cents") or 0) + 100}
                response = make_request("IDEMPOTENT", f"/venues/{venue_id}/courts/{court_id}/time_slots/{ts_id}", json=update_payload)
                # Note: IDEMPOTENT isn't a valid method, use PATCH or PUT
                response = make_request("PATCH", f"/venues/{venue_id}/courts/{court_id}/time_slots/{ts_id}", json=update_payload)
                passed = response.status_code == 200
                print_test("Update time slot (PATCH)", passed, f"New Price: {response.json().get('price_cents')}" if passed else "")

# =============================================================================
# BOOKING ROUTES
# =============================================================================
def test_bookings():
    print_section("3. BOOKING ROUTES")

    headers = {"Authorization": f"Bearer {auth_tokens['alice']}"}

    # Test 3.1: List user's bookings
    response = make_request("GET", "/bookings", headers=headers)
    passed = response.status_code == 200
    if passed:
        bookings = response.json()
        test_data['bookings'] = bookings
        print_test("List user bookings", True, f"Found {len(bookings)} bookings")
    else:
        print_test("List user bookings", False, f"Status: {response.status_code}")

    # Test 3.2: Get specific booking
    if test_data.get('bookings') and len(test_data['bookings']) > 0:
        booking_id = test_data['bookings'][0]['id']
        response = make_request("GET", f"/bookings/{booking_id}", headers=headers)
        passed = response.status_code == 200
        print_test("Get booking by ID", passed, f"Status: {response.status_code}")

    # Test 3.3: Create new booking
    if test_data.get('time_slots') and len(test_data['time_slots']) > 0:
        new_booking = {
            "time_slot_id": test_data['time_slots'][0]['id']
        }
        response = make_request("POST", "/bookings", headers=headers, json=new_booking)
        passed = response.status_code == 201
        if passed:
            booking = response.json()
            test_data['new_booking'] = booking
            print_test("Create new booking", True, f"Booking ID: {booking.get('id')}")
        else:
            print_test("Create new booking", False,
                      f"Status: {response.status_code}, Error: {response.text[:100]}")

    # Test 3.4: Update booking status
    if test_data.get('new_booking'):
        booking_id = test_data['new_booking']['id']
        update_data = {"status": "confirmed", "payment_status": "succeeded"}
        response = make_request("PATCH", f"/bookings/{booking_id}",
                               headers=headers, json=update_data)
        passed = response.status_code == 200
        print_test("Update booking status", passed, f"Status: {response.status_code}")

    # Test 3.5: Cancel booking
    if test_data.get('new_booking'):
        booking_id = test_data['new_booking']['id']
        response = make_request("DELETE", f"/bookings/{booking_id}", headers=headers)
        passed = response.status_code == 200
        print_test("Cancel booking", passed, f"Status: {response.status_code}")

# =============================================================================
# TEAMUP ROUTES
# =============================================================================
def test_events():
    print_section("4. TEAMUP ROUTES")

    headers = {"Authorization": f"Bearer {auth_tokens['alice']}"}

    # Test 4.1: List Events
    response = make_request("GET", "/events")
    passed = response.status_code == 200
    if passed:
        events = response.json()
        test_data['events'] = events
        print_test("List all Events", True, f"Found {len(events)} Events")
    else:
        print_test("List all Events", False, f"Status: {response.status_code}")

    # Test 4.2: Filter Events by status
    response = make_request("GET", "/events", params={"status": "open"})
    passed = response.status_code == 200
    if passed:
        events = response.json()
        print_test("Filter Events by status", True, f"Found {len(events)} open Events")
    else:
        print_test("Filter Events by status", False, f"Status: {response.status_code}")

    # Test 4.3: Get specific Event
    if test_data.get('events') and len(test_data['events']) > 0:
        event_id = test_data['events'][0]['id']
        response = make_request("GET", f"/events/{event_id}")
        passed = response.status_code == 200
        if passed:
            event = response.json()
            test_data['event_detail'] = event
            print_test("Get Event by ID", True,
                      f"Event: {event.get('title')}, Participants: {event.get('current_participants')}")
        else:
            print_test("Get Event by ID", False, f"Status: {response.status_code}")

    # Test 4.4: Create new Event
    new_event = {
        "title": "API Test Basketball Game",
        "description": "Created by automated test",
        "max_participants": 8,
        "visibility": "public",
        "duration_type": "temporary"
    }
    response = make_request("POST", "/events", headers=headers, json=new_event)
    passed = response.status_code == 201
    if passed:
        event = response.json()
        test_data['new_event'] = event
        print_test("Create new Event", True, f"Event ID: {event.get('id')}")
    else:
        print_test("Create new Event", False,
                  f"Status: {response.status_code}, Error: {response.text[:100]}")

    # Test 4.5: Book time slot for Event
    if test_data.get('new_event') and test_data.get('time_slots') and len(test_data['time_slots']) > 1:
        event_id = test_data['new_event']['id']
        booking_data = {"time_slot_id": test_data['time_slots'][1]['id']}
        response = make_request("POST", f"/events/{event_id}/book",
                               headers=headers, json=booking_data)
        passed = response.status_code == 201
        if passed:
            booking = response.json()
            print_test("Book time_slot for Event", True, f"Booking ID: {booking.get('id')}")
        else:
            print_test("Book time_slot for Event", False,
                      f"Status: {response.status_code}, Error: {response.text[:100]}")

    # Test 4.6: Get Event bookings
    if test_data.get('event_detail'):
        event_id = test_data['event_detail']['id']
        response = make_request("GET", f"/events/{event_id}/bookings")
        passed = response.status_code == 200
        if passed:
            bookings = response.json()
            print_test("Get Event bookings", True, f"Found {len(bookings)} bookings")
        else:
            print_test("Get Event bookings", False, f"Status: {response.status_code}")

    # Test 4.7: Submit join request (as Bob)
    if test_data.get('new_event'):
        headers_bob = {"Authorization": f"Bearer {auth_tokens['bob']}"}
        event_id = test_data['new_event']['id']
        join_data = {"message": "I'd like to join this game!"}
        response = make_request("POST", f"/events/{event_id}/join",
                               headers=headers_bob, json=join_data)
        passed = response.status_code == 201
        if passed:
            join_req = response.json()
            test_data['join_request'] = join_req
            print_test("Submit join request", True, f"Request ID: {join_req.get('id')}")
        else:
            print_test("Submit join request", False, f"Status: {response.status_code}")

    # Test 4.8: List join requests (as owner Alice)
    if test_data.get('new_event'):
        event_id = test_data['new_event']['id']
        response = make_request("GET", f"/events/{event_id}/join-requests", headers=headers)
        passed = response.status_code == 200
        if passed:
            requests_list = response.json()
            print_test("List join requests", True, f"Found {len(requests_list)} requests")
        else:
            print_test("List join requests", False, f"Status: {response.status_code}")

    # Test 4.9: Approve join request
    if test_data.get('new_event') and test_data.get('join_request'):
        event_id = test_data['new_event']['id']
        request_id = test_data['join_request']['id']
        review_data = {"action": "approve"}
        response = make_request("POST", f"/events/{event_id}/join-requests/{request_id}/review",
                               headers=headers, json=review_data)
        passed = response.status_code == 200
        print_test("Approve join request", passed, f"Status: {response.status_code}")

# =============================================================================
# USER ROUTES
# =============================================================================
def test_user_routes():
    print_section("5. USER DATA AGGREGATION ROUTES")
    headers = {"Authorization": f"Bearer {auth_tokens['alice']}"}

    # Test 5.1: Get User Events (Created, Joined, Requested)
    response = make_request("GET", "/user/events", headers=headers)
    passed = response.status_code == 200
    if passed:
        events = response.json()
        print_test("Get aggregated user events", True, f"Found {len(events)} events")
        # Verify structure
        if len(events) > 0:
            print(f"      Sample event role: {events[0].get('role')}")
    else:
        print_test("Get aggregated user events", False, f"Status: {response.status_code}")

    # Test 5.2: Get User Join Requests
    response = make_request("GET", "/user/events/join_requests", headers=headers)
    passed = response.status_code == 200
    if passed:
        reqs = response.json()
        print_test("Get user join requests", True, f"Found {len(reqs)} requests")
        if len(reqs) > 0:
            req_id = reqs[0]['id']
            # Test 5.3: Get Single Join Request
            resp_detail = make_request("GET", f"/user/events/join_requests/{req_id}", headers=headers)
            print_test("Get single join request", resp_detail.status_code == 200)
    else:
        print_test("Get user join requests", False, f"Status: {response.status_code}")

    # Test 5.4: Get User Bookings
    response = make_request("GET", "/user/bookings", headers=headers)
    passed = response.status_code == 200
    if passed:
        bookings = response.json()
        print_test("Get user bookings", True, f"Found {len(bookings)} bookings")
    else:
        print_test("Get user bookings", False, f"Status: {response.status_code}")

    # Test 5.5: User Info
    response = make_request("GET", "/user/info", headers=headers)
    passed = response.status_code == 200
    if passed:
        info = response.json()
        print_test("Get user info", True, f"Email: {info.get('email')}")
        
        # Update Info
        new_name = info.get('display_name', '') + " (Updated)"
        resp_update = make_request("PUT", "/user/info", headers=headers, json={"display_name": new_name})
        passed_update = resp_update.status_code == 200
        print_test("Update user info", passed_update, f"New Name: {resp_update.json().get('display_name')}" if passed_update else "")
    else:
        print_test("Get user info", False, f"Status: {response.status_code}")

# =============================================================================
# TICKET ROUTES
# =============================================================================
def test_tickets():
    print_section("6. TICKET ROUTES")
    headers = {"Authorization": f"Bearer {auth_tokens['alice']}"}
    
    # 6.1 Create Ticket
    new_ticket = {
        "date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "start_time": "18:00",
        "duration_minutes": 60,
        "sport_type": "basketball",
        "intensity": "mid",
        "venue_ids": [test_data['venues'][0]['venue']['id']] if test_data.get('venues') else []
    }
    response = make_request("POST", "/tickets", headers=headers, json=new_ticket)
    passed = response.status_code in [200, 201]
    if passed:
        ticket = response.json()
        test_data['ticket'] = ticket
        print_test("Create ticket", True, f"ID: {ticket.get('id')}")
    else:
        print_test("Create ticket", False, f"Status: {response.status_code} {response.text}")

    # 6.2 List Tickets
    response = make_request("GET", "/tickets", headers=headers)
    passed = response.status_code == 200
    print_test("List tickets", passed, f"Status: {response.status_code}")

    # 6.3 Get Ticket Details
    if test_data.get('ticket'):
        t_id = test_data['ticket']['id']
        response = make_request("GET", f"/tickets/{t_id}", headers=headers)
        passed = response.status_code == 200
        print_test("Get ticket details", passed, f"Status: {response.status_code}")

# =============================================================================
# NOTIFICATION ROUTES
# =============================================================================
def test_notifications():
    print_section("7. NOTIFICATION ROUTES")
    headers = {"Authorization": f"Bearer {auth_tokens['alice']}"}

    # 7.1 List Notifications
    response = make_request("GET", "/notifications", headers=headers)
    passed = response.status_code == 200
    if passed:
        notifs = response.json()
        test_data['notifications'] = notifs
        print_test("List notifications", True, f"Found {len(notifs)} notifications")
    else:
        print_test("List notifications", False, f"Status: {response.status_code}")

    # 7.2 Mark as Read
    if test_data.get('notifications') and len(test_data['notifications']) > 0:
        n_id = test_data['notifications'][0]['id']
        response = make_request("POST", f"/notifications/{n_id}/read", headers=headers)
        passed = response.status_code == 200
        print_test("Mark as read", passed, f"Status: {response.status_code}")


# =============================================================================
# SUMMARY
# =============================================================================
def print_summary():
    print_section("TEST SUMMARY")
    print("\n✅ All route tests completed!")
    print("\nTested endpoints:")
    print("  - Authentication: Login, Signup")
    print("  - Venues: Search, Get by ID, Get court time slots")
    print("  - Bookings: List, Get, Create, Update, Cancel")
    print("  - Events: List, Filter, Get, Create, Book time slot, Join requests")
    print("\nCheck the results above for any failures.")
    print("\n" + "=" * 80)

# =============================================================================
# MAIN
# =============================================================================
def main():
    print("\n" + "=" * 80)
    print("  TEAMUP API ROUTE TESTING")
    print("  Base URL: " + BASE_URL)
    print("=" * 80)

    try:
        test_auth()
        test_venues()
        test_bookings()
        test_events()
        test_user_routes()
        test_tickets()
        test_notifications()
        print_summary()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
