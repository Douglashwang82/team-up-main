# Route Testing Guide

Complete guide to test all API routes with your seeded data.

## Prerequisites

1. **Database is seeded:**
   ```bash
   python3 seed.py
   ```

2. **API server is running:**
   ```bash
   # Start your Flask/FastAPI server
   python3 app/main.py
   # Or if using Docker:
   docker-compose up
   ```

## Automated Testing

Run the comprehensive test script:

```bash
cd /Users/hwangdouglas/Projects/team-up-main/services/api

# If your API runs on localhost:8000
python3 test_routes.py

# If your API runs on a different port, edit test_routes.py and change:
# BASE_URL = "http://localhost:YOUR_PORT"
```

The script will test:
- ✅ Authentication (login, signup)
- ✅ Venue routes (search, geolocation, timeslots)
- ✅ Booking routes (CRUD operations)
- ✅ TeamUp routes (create, join, manage)

## Manual Testing with cURL

### 1. Authentication Routes

**Login:**
```bash
# Login as Alice
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}'

# Save the access_token from response
export TOKEN="your_access_token_here"
```

**Signup:**
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "display_name": "New User"
  }'
```

### 2. Venue Routes

**Search all venues:**
```bash
curl http://localhost:8000/venues
```

**Search by geolocation (5km around Taipei):**
```bash
curl "http://localhost:8000/venues?lat=25.0330&lng=121.5654&distance=5000"
```

**Search with sport type:**
```bash
curl "http://localhost:8000/venues?sport_type=basketball"
```

**Search with datetime:**
```bash
curl "http://localhost:8000/venues?datetime=2025-10-20"
```

**Get specific venue:**
```bash
# Get venue ID from previous search, then:
curl http://localhost:8000/venues/{venue_id}
```

**Get court timeslots:**
```bash
curl http://localhost:8000/venues/{venue_id}/courts/{court_id}/timeslots
```

### 3. Booking Routes

**List user's bookings:**
```bash
curl http://localhost:8000/bookings \
  -H "Authorization: Bearer $TOKEN"
```

**Get specific booking:**
```bash
curl http://localhost:8000/bookings/{booking_id} \
  -H "Authorization: Bearer $TOKEN"
```

**Create new booking:**
```bash
curl -X POST http://localhost:8000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeslot_id": "timeslot_uuid_here"
  }'
```

**Update booking:**
```bash
curl -X PATCH http://localhost:8000/bookings/{booking_id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "confirmed",
    "payment_status": "succeeded"
  }'
```

**Cancel booking:**
```bash
curl -X DELETE http://localhost:8000/bookings/{booking_id} \
  -H "Authorization: Bearer $TOKEN"
```

### 4. TeamUp Routes

**List TeamUps:**
```bash
# All TeamUps
curl http://localhost:8000/teamups

# Filter by status
curl "http://localhost:8000/teamups?status=open"

# Filter by visibility
curl "http://localhost:8000/teamups?visibility=public"
```

**Get specific TeamUp:**
```bash
curl http://localhost:8000/teamups/{teamup_id}
```

**Create TeamUp:**
```bash
curl -X POST http://localhost:8000/teamups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekend Basketball",
    "description": "Looking for players!",
    "max_participants": 10,
    "visibility": "public",
    "durantion_type": "temporary"
  }'
```

**Book timeslot for TeamUp:**
```bash
curl -X POST http://localhost:8000/teamups/{teamup_id}/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeslot_id": "timeslot_uuid_here"
  }'
```

**Get TeamUp bookings:**
```bash
curl http://localhost:8000/teamups/{teamup_id}/bookings
```

**Submit join request:**
```bash
curl -X POST http://localhost:8000/teamups/{teamup_id}/join \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I would like to join!"
  }'
```

**List join requests (owner only):**
```bash
curl http://localhost:8000/teamups/{teamup_id}/join-requests \
  -H "Authorization: Bearer $TOKEN"
```

**Review join request (owner only):**
```bash
curl -X POST http://localhost:8000/teamups/{teamup_id}/join-requests/{request_id}/review \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve"
  }'
```

## Testing with Postman

1. Import the routes into Postman
2. Set environment variable `BASE_URL` = `http://localhost:8000`
3. Set environment variable `TOKEN` after login
4. Use `{{BASE_URL}}` and `{{TOKEN}}` in requests

### Example Postman Collection Structure:

```
TeamUp API
├── Auth
│   ├── Login (POST /auth/login)
│   └── Signup (POST /auth/signup)
├── Venues
│   ├── Search Venues (GET /venues)
│   ├── Search by Location (GET /venues?lat=25.0330&lng=121.5654)
│   ├── Get Venue (GET /venues/:id)
│   └── Get Court Timeslots (GET /venues/:id/courts/:court_id/timeslots)
├── Bookings
│   ├── List Bookings (GET /bookings)
│   ├── Get Booking (GET /bookings/:id)
│   ├── Create Booking (POST /bookings)
│   ├── Update Booking (PATCH /bookings/:id)
│   └── Cancel Booking (DELETE /bookings/:id)
└── TeamUps
    ├── List TeamUps (GET /teamups)
    ├── Get TeamUp (GET /teamups/:id)
    ├── Create TeamUp (POST /teamups)
    ├── Book Timeslot (POST /teamups/:id/book)
    ├── Get Bookings (GET /teamups/:id/bookings)
    ├── Join TeamUp (POST /teamups/:id/join)
    ├── List Join Requests (GET /teamups/:id/join-requests)
    └── Review Join Request (POST /teamups/:id/join-requests/:req_id/review)
```

## Test User Credentials

From seed data:

| Email | Password | Display Name |
|-------|----------|--------------|
| alice@example.com | password123 | Alice Chen |
| bob@example.com | password123 | Bob Wang |
| charlie@example.com | password123 | Charlie Lin |
| diana@example.com | password123 | Diana Wu |
| evan@example.com | password123 | Evan Lee |
| fiona@example.com | password123 | Fiona Zhang |

## Expected Results

### Seeded Data Counts:
- 6 Users
- 5 Venues
- 15+ Courts
- 1000+ Timeslots (14 days × 6 slots × courts)
- 6 TeamUps
- 20+ Participants
- 5 Join Requests
- 9 Bookings

### Test Scenarios:

1. **Geolocation Search:**
   - All venues are in Taipei/New Taipei area
   - Searching with lat=25.0330, lng=121.5654 should find multiple venues
   - Different distances should return different counts

2. **TeamUp Join Flow:**
   - Alice creates TeamUp → Bob requests to join → Alice approves
   - Bob becomes a participant

3. **Booking Flow:**
   - User creates pending booking
   - Updates status to confirmed
   - Updates payment_status to succeeded
   - Can cancel if needed

4. **TeamUp Booking:**
   - TeamUp owner books multiple timeslots
   - All bookings associated with TeamUp ID
   - Participants can see all TeamUp bookings

## Troubleshooting

### Issue: 401 Unauthorized
- Token expired or invalid
- Login again to get fresh token

### Issue: 404 Not Found
- Check the UUID format
- Verify the resource exists in database

### Issue: 400 Bad Request
- Check request body format
- Verify all required fields are present

### Issue: 403 Forbidden
- User doesn't have permission (e.g., not TeamUp owner)
- Check if you're using the correct user's token

### Issue: 409 Conflict
- Timeslot already booked
- Duplicate join request
- Check database state

## Next Steps

After testing:
1. Check application logs for any errors
2. Verify data integrity in database
3. Test error cases (invalid IDs, missing fields, etc.)
4. Load test with multiple concurrent requests
5. Test with frontend application
