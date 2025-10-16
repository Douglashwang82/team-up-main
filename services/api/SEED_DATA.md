# Database Seed Script Documentation

## Overview

The `seed.py` script populates your database with realistic sample data for development and testing purposes.

## What Gets Seeded

### 1. **Users** (6 users)
All users have the password: `password123`

| Email | Display Name | Phone | Role |
|-------|--------------|-------|------|
| alice@example.com | Alice Chen | +886-912-345-678 | TeamUp Owner (Basketball) |
| bob@example.com | Bob Wang | +886-923-456-789 | TeamUp Owner (Badminton) |
| charlie@example.com | Charlie Lin | +886-934-567-890 | TeamUp Owner (Friday Hoops) |
| diana@example.com | Diana Wu | +886-945-678-901 | TeamUp Owner (Tennis) |
| evan@example.com | Evan Lee | +886-956-789-012 | TeamUp Owner (Volleyball) |
| fiona@example.com | Fiona Zhang | +886-967-890-123 | TeamUp Owner (Sunday Badminton) |

### 2. **Venues** (5 venues with 14 courts total)

#### Taipei Sports Center
- **Location**: Songshan District, Taipei
- **Coordinates**: 25.0520, 121.5491
- **Courts**: 4 courts (2 basketball, 2 badminton)
- **Partner Code**: TSC001

#### Xinyi Sports Complex
- **Location**: Xinyi District, Taipei
- **Coordinates**: 25.0363, 121.5645
- **Courts**: 3 courts (2 basketball, 1 volleyball)
- **Partner Code**: XSC001

#### Da'an Fitness Center
- **Location**: Da'an District, Taipei
- **Coordinates**: 25.0261, 121.5332
- **Courts**: 4 courts (2 badminton, 2 tennis)
- **Partner Code**: DFC001

#### Banqiao Stadium
- **Location**: Banqiao District, New Taipei City
- **Coordinates**: 25.0141, 121.4627
- **Courts**: 3 courts (2 basketball, 1 volleyball)
- **Partner Code**: BQS001

#### Tamsui Riverside Park
- **Location**: Tamsui District, New Taipei City
- **Coordinates**: 25.1740, 121.4458
- **Courts**: 2 courts (2 basketball outdoor)
- **Partner Code**: TRP001

### 3. **Timeslots** (~1,176 timeslots)

**Time Coverage**: Next 14 days

**Daily Schedule** (for each court):
- 09:00-11:00 — 800 TWD
- 11:00-13:00 — 800 TWD
- 14:00-16:00 — 1,000 TWD
- 16:00-18:00 — 1,000 TWD
- 18:00-20:00 — 1,200 TWD (peak hours)
- 20:00-22:00 — 1,200 TWD (peak hours)

**Formula**: 14 courts × 6 timeslots/day × 14 days = 1,176 timeslots

**Note**: Today's timeslots are marked as `is_bookable=False` (already reserved)

### 4. **TeamUps** (6 TeamUps)

#### TeamUp #1: Weekend Basketball Game
- **Owner**: Alice Chen
- **Status**: Open
- **Participants**: 4/10 (Alice, Bob, Charlie, Diana)
- **Sport**: Basketball
- **Visibility**: Public
- **Deadline**: 5 days from now
- **Bookings**: 1 confirmed booking

#### TeamUp #2: Badminton Doubles Practice
- **Owner**: Bob Wang
- **Status**: Open
- **Participants**: 3/8 (Bob, Evan, Fiona)
- **Sport**: Badminton
- **Visibility**: Public
- **Deadline**: 3 days from now
- **Bookings**: 1 pending booking

#### TeamUp #3: Friday Night Hoops
- **Owner**: Charlie Lin
- **Status**: Confirmed ✅
- **Participants**: 6/12 (Full roster - Charlie, Alice, Bob, Diana, Evan, Fiona)
- **Sport**: Basketball
- **Visibility**: Public
- **Deadline**: 2 days from now
- **Bookings**: 1 confirmed booking

#### TeamUp #4: Tennis Club - Beginner Friendly
- **Owner**: Diana Wu
- **Status**: Open
- **Participants**: 2/6 (Diana, Charlie)
- **Sport**: Tennis
- **Visibility**: Invite-only 🔒
- **Invite Token**: `TENNIS2024ABC`
- **Deadline**: 7 days from now
- **Bookings**: 1 confirmed booking

#### TeamUp #5: Volleyball Tournament Prep
- **Owner**: Evan Lee
- **Status**: Confirmed ✅
- **Participants**: 6/8 (Evan, Alice, Bob, Charlie, Diana, Fiona)
- **Sport**: Volleyball
- **Visibility**: Private 🔒
- **Deadline**: 1 day from now
- **Bookings**: 1 confirmed booking

#### TeamUp #6: Sunday Morning Badminton
- **Owner**: Fiona Zhang
- **Status**: Open
- **Participants**: 3/8 (Fiona, Bob, Diana)
- **Sport**: Badminton
- **Visibility**: Public
- **Deadline**: 4 days from now
- **Bookings**: 1 pending booking

### 5. **Participants** (28 total)

Distributed across 6 TeamUps with varying participation levels:
- Each TeamUp has an **owner** participant (role: "owner")
- Additional **member** participants (role: "member")
- Mix of filled and partially filled teams

### 6. **Join Requests** (5 requests)

| TeamUp | Applicant | Status | Message |
|--------|-----------|--------|---------|
| Weekend Basketball | Evan | Submitted ⏳ | "I'd love to join! I play center position." |
| Weekend Basketball | Fiona | Approved ✅ | "Can I join? I'm a beginner but eager to learn!" |
| Badminton Doubles | Diana | Submitted ⏳ | "Looking for regular practice partners!" |
| Tennis Club | Alice | Submitted ⏳ | "Got the invite token from a friend. Excited to learn!" |
| Sunday Badminton | Charlie | Rejected ❌ | "Perfect timing! Count me in." |

### 7. **Bookings** (9 bookings)

#### TeamUp Bookings (6):
1. **Alice** - Weekend Basketball → Confirmed, Payment: Succeeded
2. **Bob** - Badminton Doubles → Pending, Payment: Pending
3. **Charlie** - Friday Night Hoops → Confirmed, Payment: Succeeded
4. **Diana** - Tennis Club → Confirmed, Payment: Succeeded
5. **Evan** - Volleyball Tournament → Confirmed, Payment: Succeeded
6. **Fiona** - Sunday Badminton → Pending, Payment: Pending

#### Individual Bookings (3):
7. **Alice** - Individual → Confirmed, Payment: Succeeded
8. **Bob** - Individual → Pending, Payment: None
9. **Diana** - Individual → Cancelled, Payment: Failed

## Usage

### Prerequisites

1. **Database Setup**: Ensure PostgreSQL with PostGIS is running
2. **Migrations Applied**: Run all Alembic migrations
3. **Virtual Environment**: Activate your Python virtual environment

### Running the Seed Script

```bash
# Navigate to API directory
cd services/api

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Run the seed script
python seed.py
```

### Expected Output

```
============================================================
🌱 TEAMUP DATABASE SEEDING
============================================================
🗑️  Clearing existing data...
✅ All data cleared

👤 Creating users...
✅ Created 6 users

🏟️  Creating venues and courts...
✅ Created 5 venues with 14 courts

⏰ Creating timeslots...
✅ Created 1176 timeslots

⚽ Creating TeamUps...
✅ Created 6 TeamUps

👥 Creating participants...
✅ Created 28 participants

📝 Creating join requests...
✅ Created 5 join requests

📅 Creating bookings...
✅ Created 9 bookings

============================================================
📊 SEEDING SUMMARY
============================================================
👤 Users:              6
🏟️  Venues:             5
🎾 Courts:             14
⏰ Timeslots:          1176
⚽ TeamUps:            6
👥 Participants:       28
📝 Join Requests:      5
📅 Bookings:           9
============================================================

📧 Test User Credentials:
------------------------------------------------------------
Email: alice@example.com   | Password: password123
Email: bob@example.com     | Password: password123
Email: charlie@example.com | Password: password123
Email: diana@example.com   | Password: password123
Email: evan@example.com    | Password: password123
Email: fiona@example.com   | Password: password123
------------------------------------------------------------

✅ Seeding completed successfully!
🚀 You can now start your API server and test with the seeded data.
```

## Testing Scenarios

### 1. User Authentication
```bash
# Login as Alice
POST /auth/login
{
  "email": "alice@example.com",
  "password": "password123"
}
```

### 2. Browse Public TeamUps
```bash
GET /teamups?visibility=public
# Should return 4 public TeamUps
```

### 3. Join a TeamUp
```bash
# Login as Evan, then join Weekend Basketball
POST /teamups/{teamup_id}/join
{
  "message": "I'd love to play!"
}
```

### 4. Search Venues
```bash
# Search for basketball courts in Taipei
GET /venues/search?sport_type=basketball&city=Taipei
```

### 5. View Available Timeslots
```bash
# Get timeslots for a specific court
GET /venues/{venue_id}/courts/{court_id}/timeslots
```

### 6. Book a Timeslot
```bash
# Create individual booking
POST /bookings
{
  "timeslot_id": "uuid-here"
}
```

### 7. Book Timeslot for TeamUp
```bash
# Book for a TeamUp (owner only)
POST /teamups/{teamup_id}/book
{
  "timeslot_id": "uuid-here"
}
```

### 8. View My TeamUps
```bash
# Get TeamUps I created
GET /teamups/my/created

# Get TeamUps I joined
GET /teamups/my/joined
```

### 9. Review Join Requests
```bash
# Get join requests for my TeamUp (owner only)
GET /teamups/{teamup_id}/join-requests

# Approve/reject a request
POST /teamups/{teamup_id}/join-requests/{request_id}/review
{
  "action": "approve"  # or "reject"
}
```

### 10. Access Invite-Only TeamUp
```bash
# Use invite token
GET /teamups/token/TENNIS2024ABC
```

## Data Relationships

```
User (6)
 ├─> TeamUp (owner) → Participants → Join Requests
 ├─> Booking (owner) → Timeslot → Court → Venue
 └─> TeamUpParticipant (member)

Venue (5)
 └─> Court (14)
      └─> Timeslot (1176)
           └─> Booking (9)
                └─> TeamUp (optional)

TeamUp (6)
 ├─> TeamUpParticipant (28)
 ├─> TeamUpJoinRequest (5)
 └─> Booking (6)
```

## Clearing Data

The seed script automatically clears all existing data before seeding. To manually clear:

```python
from sqlalchemy.orm import Session
from app.core.db import engine
from app.models import *

with Session(engine) as session:
    session.query(TeamUpJoinRequest).delete()
    session.query(TeamUpParticipant).delete()
    session.query(Booking).delete()
    session.query(TeamUp).delete()
    session.query(Timeslot).delete()
    session.query(Court).delete()
    session.query(Venue).delete()
    session.query(User).delete()
    session.commit()
```

## Customization

### Adding More Users

Edit the `users_data` list in `create_users()`:

```python
users_data = [
    {
        "email": "newuser@example.com",
        "password": "password123",
        "display_name": "New User",
        "phone": "+886-987-654-321"
    },
    # ... existing users
]
```

### Changing Timeslot Prices

Modify the `time_slots` list in `create_timeslots()`:

```python
time_slots = [
    (9, 11, 1000),   # Morning - 1000 TWD (increased)
    (11, 13, 1000),
    # ...
]
```

### Adding More Venues

Edit the `venues_data` list in `create_venues_and_courts()`:

```python
{
    "name": "New Venue",
    "address": "123 Main St",
    "city": "Taipei",
    "lat": 25.0330,
    "lng": 121.5654,
    "contact_phone": "+886-2-1234-5678",
    "partner_code": "NV001",
    "courts": [
        {"name": "Court 1", "sport_type": "basketball"},
    ]
}
```

## Troubleshooting

### Error: "Cannot connect to database"
**Solution**: Ensure PostgreSQL is running and connection settings in `.env` are correct.

### Error: "PostGIS extension not found"
**Solution**: Install PostGIS extension in your database:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Error: "Timeslot overlap constraint violation"
**Solution**: This shouldn't happen with seed data, but if it does, check that you're using the simplified Timeslot model (not old CourtTimeslot).

### Error: "Foreign key violation"
**Solution**: Ensure migrations are up to date:
```bash
python -m alembic upgrade head
```

## Next Steps

After seeding:

1. ✅ Start the Flask API server
2. ✅ Test authentication with seeded users
3. ✅ Browse TeamUps in the web app
4. ✅ Test booking flows
5. ✅ Test join request flows

## Notes

- **Development Only**: This seed script is for development/testing only
- **Passwords**: All users use `password123` - never use this in production
- **Geo Data**: Uses real Taiwan coordinates for realistic geospatial queries
- **Time-based**: Timeslots are relative to current date, so data stays relevant
- **Idempotent**: Can be run multiple times (clears data first)

## Support

If you encounter issues:
1. Check database connection settings
2. Ensure all migrations are applied
3. Verify PostGIS extension is installed
4. Check console output for specific error messages
