# Simple TeamUp Design - Optional Booking Assignment

## Overview

TeamUp uses a simple, straightforward design with an **optional** one-to-many relationship between TeamUp and Booking.

## Design Decision

**Bookings can optionally be assigned to a TeamUp** via a nullable foreign key.

### How It Works

1. **TeamUp** = A group of people organizing to play sports together
2. **Booking** = A reservation for a court/timeslot
3. **Assignment** = A booking can optionally be linked to a TeamUp

**Flexible Design:**
- TeamUps can exist without bookings (just finding teammates)
- Bookings can exist without TeamUps (individual play)
- Bookings can be assigned to a TeamUp when needed

## Current Model Structure

### TeamUp Model

```python
class TeamUp(Base):
    __tablename__ = "teamups"

    # Core fields
    id: UUID
    title: str
    description: str | None
    owner_user_id: UUID (FK to users)

    # Settings
    max_participants: int = 10
    visibility: str = "public"  # public, private
    invite_token: str | None

    # Status
    durantion_type: str = "temporary"  # temporary, permanent
    status: str = "open"  # open, closed

    # Timestamps
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    join_requests: list[TeamUpJoinRequest]
    participants: list[TeamUpParticipant]
    bookings: list[Booking]  # Optional - TeamUp can have bookings assigned
```

### Booking Model

```python
class Booking(Base):
    __tablename__ = "bookings"

    # Core fields
    id: UUID
    owner_user_id: UUID (FK to users)
    timeslot_id: UUID (FK to timeslots)
    teamup_id: UUID | None (FK to teamups, nullable)  # Optional assignment

    # Status
    status: str = "pending"  # pending, confirmed, cancelled
    payment_status: str = "none"  # none, pending, succeeded, failed

    # Timestamps
    created_at: DateTime
    updated_at: DateTime

    # Relationships
    owner: User
    timeslot: Timeslot
    teamup: TeamUp | None  # Optional - booking can be assigned to a TeamUp
```

## Database Schema

```
┌──────────────┐         ┌──────────────────────┐
│   TeamUp     │◄────────│     Booking          │
├──────────────┤         ├──────────────────────┤
│ id (PK)      │         │ id (PK)              │
│ title        │         │ owner_user_id (FK)   │
│ owner_id     │         │ timeslot_id (FK)     │
│ visibility   │         │ teamup_id (FK) NULL  │
│ status       │         │ status               │
└──────────────┘         │ payment_status       │
       │                 └──────────────────────┘
       │                           │
       ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│ TeamUpParticipant│      │    Timeslot      │
└──────────────────┘      └──────────────────┘
```

**Relationship**: One TeamUp can have many Bookings (one-to-many)

## User Flow

### 1. Create TeamUp
```python
# User wants to find people to play basketball
teamup = TeamUp(
    title="Friday Night Basketball",
    owner_user_id=user.id,
    max_participants=10,
    visibility="public",
    status="open"
)
```

### 2. Others Join TeamUp
```python
# Other users can join
participant = TeamUpParticipant(
    teamup_id=teamup.id,
    user_id=joining_user.id,
    role="member"
)
```

### 3. Book Court (Separate Action)
```python
# Any user can book a court independently
booking = Booking(
    owner_user_id=user.id,
    timeslot_id=timeslot.id,
    status="confirmed",
    payment_status="succeeded"
)
```

### 4. Coordination via Communication
- TeamUp members coordinate via messages/chat (outside the system)
- Owner shares booking details with team members
- Members can book their own timeslots if needed

## Benefits of This Design

### Simplicity
- ✅ No junction table complexity
- ✅ Clear separation of concerns
- ✅ Easy to understand and maintain

### Flexibility
- ✅ TeamUps can exist without bookings (just finding teammates)
- ✅ Bookings can exist without TeamUps (individual play)
- ✅ Users manage their own bookings

### Scalability
- ✅ Fewer tables = better performance
- ✅ Less complex queries
- ✅ Easier to extend

## Use Cases

### Case 1: Social TeamUp (No Booking)
```
User creates "Weekend Running Group"
→ TeamUp created (no booking needed)
→ People join to find running partners
→ They coordinate meeting time/place separately
```

### Case 2: Individual Booking
```
User books a tennis court
→ Booking created (no TeamUp needed)
→ User plays individually or brings friends informally
```

### Case 3: TeamUp + Manual Coordination
```
1. User creates "Friday Basketball TeamUp"
2. 10 people join the TeamUp
3. Owner books a court (creates Booking)
4. Owner shares booking details with team via:
   - TeamUp description
   - External chat/messaging
   - Email/notifications
5. Everyone shows up at the booked time
```

## What We Don't Track

- ❌ Which booking belongs to which TeamUp
- ❌ Multiple bookings per TeamUp
- ❌ Shared bookings between TeamUps

**Why?** These add complexity without clear value for the MVP.

## Data Model Summary

**8 Core Models:**
1. ✅ User
2. ✅ Venue
3. ✅ Court
4. ✅ Timeslot
5. ✅ Booking (independent)
6. ✅ TeamUp (independent)
7. ✅ TeamUpParticipant
8. ✅ TeamUpJoinRequest

**No junction tables, no complex many-to-many relationships.**

## API Endpoints

### TeamUp Endpoints
```
GET    /teamups                  - List TeamUps
POST   /teamups                  - Create TeamUp
GET    /teamups/{id}             - Get TeamUp details
POST   /teamups/{id}/join        - Join TeamUp
GET    /teamups/{id}/participants - List participants
GET    /teamups/my/created       - My created TeamUps
GET    /teamups/my/joined        - TeamUps I joined
```

### Booking Endpoints
```
GET    /bookings                 - List my bookings
POST   /bookings                 - Create booking
GET    /bookings/{id}            - Get booking details
DELETE /bookings/{id}            - Cancel booking
```

**No `/teamups/{id}/bookings` endpoint** - TeamUps don't have bookings!

## Future Enhancements (If Needed)

If you later decide you need to link TeamUps and Bookings, you can:

1. Add a `teamup_id` FK to Booking table
2. Add a `bookings` relationship to TeamUp
3. Create a junction table for many-to-many

But for now, **keep it simple!**

## Migration Status

**No migrations needed** - we removed the junction table before it was applied.

Cleaned up:
- ✅ Deleted `teamup_booking.py` model
- ✅ Deleted junction table migration
- ✅ Removed relationships from TeamUp and Booking models
- ✅ Updated seed.py
- ✅ Deleted junction table documentation

## Seed Data

```bash
python seed.py
```

**Creates:**
- 6 Users
- 5 Venues (14 courts)
- 1,176 Timeslots
- 6 TeamUps (independent)
- 28 Participants
- 5 Join Requests
- 9 Bookings (independent)

## Summary

**TeamUp** and **Booking** are independent features:
- TeamUp = Social coordination (find teammates)
- Booking = Court reservation

No database link needed. Users coordinate manually.

Simple, clean, easy to understand. ✅
