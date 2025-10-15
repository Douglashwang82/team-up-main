# Project Simplification - Refactoring Plan

## Goal
Simplify the data model to focus on core features: Users forming TeamUps and booking court timeslots.

## Current vs Target Architecture

### Models to KEEP (8 total)
1. ✅ **User** - User data
2. ✅ **Venue** - Venue data
3. ✅ **Court** - Venue's courts (ADD `sport_type` field)
4. ✅ **Timeslot** - Available datetime for a court (RENAME from CourtTimeslot, MERGE VenueTimeslot)
5. ✅ **TeamUp** - Groups formed by users (REMOVE `court_timeslot_id`, bookings via relationship only)
6. ✅ **Booking** - Booking on timeslot (ADD `teamup_id` nullable FK)
7. ✅ **TeamUpJoinRequest** - User requests to join teamup
8. ✅ **TeamUpParticipant** - Users within a teamup

### Models to REMOVE (9 total)
1. ❌ **Event** - Redundant with TeamUp
2. ❌ **EventParticipant** - Part of Event
3. ❌ **EventJoinRequest** - Part of Event
4. ❌ **EventTeamUp** - Junction table
5. ❌ **BookingAssignment** - Overcomplicated, direct FK instead
6. ❌ **TeamUpBooking** - Already removed
7. ❌ **TeamUpTimeslot** - Direct relationship instead
8. ❌ **VenueTimeslot** - Merge into Timeslot
9. ❌ **CourtSportType** - Simple field on Court instead

---

## Detailed Changes

### 1. Court Model
**File**: `services/api/app/models/venue.py`

**Changes**:
- ADD `sport_type: str` field (nullable)
- REMOVE `sport_types` relationship to CourtSportType

**Before**:
```python
class Court:
    sport_types: Mapped[list[CourtSportType]] = relationship(...)
```

**After**:
```python
class Court:
    sport_type: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
```

---

### 2. Timeslot Model (Unified)
**File**: `services/api/app/models/venue.py`

**Changes**:
- RENAME `CourtTimeslot` → `Timeslot`
- Keep all existing fields
- REMOVE `teamups` relationship (legacy)
- REMOVE `teamup_timeslots` relationship

**After**:
```python
class Timeslot(Base):
    __tablename__ = "timeslots"  # Rename table

    id: Mapped[uuid.UUID]
    court_id: Mapped[uuid.UUID] = mapped_column(FK("courts.id"))
    starts_at: Mapped[sa.DateTime]
    ends_at: Mapped[sa.DateTime]
    price_cents: Mapped[int | None]
    currency: Mapped[str] = "USD"
    is_bookable: Mapped[bool] = True

    court: Mapped[Court] = relationship(back_populates="timeslots")
    bookings: Mapped[list["Booking"]] = relationship(...)
```

**Remove**:
- `VenueTimeslot` class entirely
- `CourtSportType` class entirely

---

### 3. TeamUp Model
**File**: `services/api/app/models/teamup.py`

**Changes**:
- REMOVE `court_timeslot_id` field
- REMOVE `court_timeslot` relationship
- REMOVE `timeslots` relationship (TeamUpTimeslot)
- REMOVE `booking_assignments` relationship
- REMOVE `events` relationship
- KEEP `bookings` relationship (but change to one-to-many)

**Before**:
```python
class TeamUp:
    court_timeslot_id: Mapped[uuid.UUID | None]
    court_timeslot = relationship(...)
    timeslots: Mapped[list["TeamUpTimeslot"]] = ...
    booking_assignments: Mapped[list["BookingAssignment"]] = ...
    events: Mapped[list["EventTeamUp"]] = ...
```

**After**:
```python
class TeamUp(Base):
    __tablename__ = "teamups"

    id: Mapped[uuid.UUID]
    title: Mapped[str]
    description: Mapped[str | None]
    owner_user_id: Mapped[uuid.UUID] = mapped_column(FK("users.id"))

    # Team settings
    min_participants: Mapped[int] = 2
    max_participants: Mapped[int] = 10
    deadline: Mapped[sa.DateTime | None]
    sport_type: Mapped[str | None]

    # Visibility
    visibility: Mapped[str] = "public"  # public, invite_only, private
    invite_token: Mapped[str | None]

    # Status
    status: Mapped[str] = "open"  # open, closed, confirmed, cancelled

    # Relationships
    participants: Mapped[list["TeamUpParticipant"]] = relationship(...)
    join_requests: Mapped[list["TeamUpJoinRequest"]] = relationship(...)
    bookings: Mapped[list["Booking"]] = relationship(...)  # One-to-many!
```

---

### 4. Booking Model
**File**: `services/api/app/models/booking.py`

**Changes**:
- ADD `teamup_id: uuid.UUID | None` field
- RENAME `timeslot_id` to reference new unified `timeslots` table
- REMOVE `venue_id` (derivable from timeslot)
- REMOVE `assignments` relationship
- ADD `teamup` relationship

**Before**:
```python
class Booking:
    owner_user_id: Mapped[uuid.UUID]
    venue_id: Mapped[uuid.UUID]
    timeslot_id: Mapped[uuid.UUID]
    assignments: Mapped[list["BookingAssignment"]] = ...
```

**After**:
```python
class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID]
    owner_user_id: Mapped[uuid.UUID] = mapped_column(FK("users.id"))
    timeslot_id: Mapped[uuid.UUID] = mapped_column(FK("timeslots.id"))
    teamup_id: Mapped[uuid.UUID | None] = mapped_column(FK("teamups.id"))

    status: Mapped[str] = "pending"  # pending, confirmed, cancelled
    payment_status: Mapped[str] = "none"  # none, pending, succeeded, failed

    # Relationships
    owner: Mapped["User"] = relationship(...)
    timeslot: Mapped["Timeslot"] = relationship(...)
    teamup: Mapped["TeamUp"] = relationship(back_populates="bookings")
```

---

### 5. Venue Model
**File**: `services/api/app/models/venue.py`

**Changes**:
- REMOVE `venue_timeslots` relationship
- REMOVE `bookings` relationship (derivable via courts → timeslots → bookings)

---

## Files to DELETE

### Model Files
1. `services/api/app/models/event.py`
2. `services/api/app/models/event_teamup.py`
3. `services/api/app/models/participant.py` (EventParticipant)
4. `services/api/app/models/join_request.py` (EventJoinRequest)
5. `services/api/app/models/booking_assignment.py`
6. `services/api/app/models/teamup_timeslot.py`

### Route Files (Update, not delete)
- `services/api/app/routes/events.py` - DELETE entire file
- `services/api/app/routes/bookings.py` - SIMPLIFY (remove assignments)
- `services/api/app/routes/teamups.py` - UPDATE (remove timeslot logic)

---

## Database Migration Strategy

### Phase 1: Add New Fields
1. Add `sport_type` to `courts` table
2. Add `teamup_id` to `bookings` table
3. Rename `court_timeslots` → `timeslots`

### Phase 2: Migrate Data
1. Migrate `court_sport_types` data to `courts.sport_type`
2. Migrate `booking_assignments` to `bookings.teamup_id`
3. Migrate `teamup_bookings` to `bookings.teamup_id` (if any data exists)

### Phase 3: Drop Old Structures
1. Drop `venue_timeslots` table
2. Drop `court_sport_types` table
3. Drop `events` table
4. Drop `event_participants` table
5. Drop `event_join_requests` table
6. Drop `event_teamups` table
7. Drop `booking_assignments` table
8. Drop `teamup_timeslots` table
9. Drop `teamup.court_timeslot_id` column
10. Drop `bookings.venue_id` column

---

## API Changes

### Endpoints to REMOVE
- All `/events/*` endpoints
- `/bookings/{id}/assign`
- `/bookings/{id}/assignments`

### Endpoints to UPDATE
- `POST /teamups` - Remove `court_timeslot_id` requirement
- `GET /teamups/{id}` - Return `bookings` array instead of single timeslot
- New: `POST /teamups/{id}/book` - Create booking for teamup

### New Simplified Flow

**Create TeamUp without timeslot**:
```
POST /teamups
{
  "title": "Weekend Basketball",
  "min_participants": 4,
  "max_participants": 10,
  "visibility": "public",
  "sport_type": "basketball"
}
```

**Book timeslot for TeamUp**:
```
POST /teamups/{teamup_id}/book
{
  "timeslot_id": "uuid-here"
}
→ Creates Booking with teamup_id link
```

**TeamUp can book multiple timeslots** (recurring sessions):
```
POST /teamups/{teamup_id}/book (again with different timeslot)
→ Creates another Booking linked to same TeamUp
```

---

## Benefits of This Simplification

1. ✅ **50% fewer models** - 8 instead of 17
2. ✅ **Clearer mental model** - TeamUp is the only group concept
3. ✅ **Simpler relationships** - No complex many-to-many junction tables
4. ✅ **Easier to maintain** - Less code, fewer edge cases
5. ✅ **Better performance** - Fewer joins needed
6. ✅ **More flexible** - TeamUp can exist without timeslot, can book multiple sessions

---

## Next Steps

1. Review and approve this plan
2. Create database migrations
3. Update model files
4. Update route files
5. Update OpenAPI spec
6. Test migrations
7. Update frontend code (if applicable)

**Estimated Time**: 2-3 hours for backend changes + testing
**Risk Level**: Medium (large refactoring, but well-defined scope)
**Rollback**: All migrations will include downgrade functions
