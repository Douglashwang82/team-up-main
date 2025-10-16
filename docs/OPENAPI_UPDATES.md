# OpenAPI Specification Updates

## Summary
Updated `docs/openapi.yaml` to reflect the simplified architecture (8 models instead of 17).

## Changes Made

### ✅ Removed Endpoints

**All Event Endpoints (Removed)**
- `GET /events` - List events near a point
- `POST /events` - Create event
- `GET /events/all` - Get all events
- `GET /events/public` - Get public events
- `GET /events/token/{invite_token}` - Get invite-only event
- `GET /events/{id}` - Get event details
- `POST /events/{id}/join` - Join event
- `DELETE /events/{id}/leave` - Leave event
- `GET /events/{id}/participants` - List event participants
- `GET /events/owner/{id}/join-requests` - List join requests for event
- `POST /events/owner/{req_id}/join-requests` - Review join request
- `GET /events/{id}/bookings` - List event bookings
- `GET /events/{id}/teamups` - List event teamups
- `POST /events/{id}/teamups` - Add teamup to event

**Booking Assignment Endpoints (Removed)**
- `POST /bookings/{id}/assign` - Assign booking to TeamUp or Event
- `GET /bookings/{id}/assignments` - List booking assignments

**TeamUp-Event Relationship Endpoint (Removed)**
- `GET /teamups/{id}/events` - List teamup events

### ✅ Added Endpoints

**New TeamUp Booking Endpoints**
- `POST /teamups/{id}/book` - Book a timeslot for a TeamUp (can book multiple)
- `GET /teamups/{id}/bookings` - List all bookings for a TeamUp

### ✅ Updated Schemas

**TeamUpCreateIn** (lines 644-669)
- **REMOVED** `court_timeslot_id` (no longer required)
- **KEPT** all other fields: title, description, min_participants, max_participants, deadline, sport_type, visibility

**TeamUpCreateResponse** (lines 671-691)
- **ADDED** `visibility` field to response

**TeamUpDetail** (lines 741-791)
- **REMOVED** `court_timeslot` object (single timeslot reference)
- **ADDED** `bookings` array (list of TeamUpBookingDetail)

**TeamUpBookingDetail** (NEW schema, lines 897-956)
```yaml
properties:
  - id (UUID)
  - status (enum: pending, confirmed, cancelled)
  - payment_status (enum: none, pending, succeeded, failed)
  - timeslot (object with id, starts_at, ends_at, price_cents, currency)
  - court (object with id, name, sport_type)
  - venue (object with id, name, address, city)
  - created_at (datetime)
```

**BookingOut** (lines 958-986)
- **REMOVED** `venue_id` field
- **ADDED** `teamup_id` field (nullable UUID)

**BookingDetail** (lines 988-1072)
- **REMOVED** `venue_id` field
- **REMOVED** `assignments` array
- **ADDED** `teamup_id` field (nullable UUID)
- **ADDED** `court` object (with id, name, sport_type)
- **ADDED** `teamup` object (nullable, with id, title, description)
- **UPDATED** `venue` - now derived from timeslot → court → venue chain

### ✅ Removed Schemas

- `EventCreateIn` - Create event request
- `EventOut` - Event response
- `BookingAssignmentIn` - Booking assignment request
- `BookingAssignmentOut` - Booking assignment response
- `EventTeamUpIn` - Event-TeamUp relationship request
- `EventTeamUpOut` - Event-TeamUp relationship response

## Impact on API Clients

### Breaking Changes

1. **All Event endpoints removed** - Frontend/mobile apps using Event endpoints must be updated
2. **TeamUp creation no longer requires timeslot** - `court_timeslot_id` is not needed
3. **Booking structure changed** - `venue_id` removed, `teamup_id` added
4. **BookingDetail response changed** - Includes `court` and `teamup` objects instead of `assignments`

### New Features

1. **Flexible TeamUp booking** - TeamUps can now book multiple timeslots over time
2. **Simplified relationships** - Direct FK instead of junction tables
3. **Clearer data model** - One group concept (TeamUp) instead of two (TeamUp + Event)

## Migration Path for Frontend

### 1. Remove Event-related code
```typescript
// REMOVE these API calls:
- apis.events.createEvent()
- apis.events.getEventById()
- apis.events.joinEvent()
- apis.events.listEventParticipants()
// etc.
```

### 2. Update TeamUp creation
```typescript
// BEFORE:
createTeamup({
  court_timeslot_id: "uuid",  // REQUIRED
  title: "...",
  min_participants: 4,
  max_participants: 10
})

// AFTER:
createTeamup({
  title: "...",
  min_participants: 4,
  max_participants: 10,
  visibility: "public"  // NEW
})
// Then book timeslots separately:
apis.teamups.bookTimeslotForTeamup({
  id: teamupId,
  body: { timeslot_id: "uuid" }
})
```

### 3. Update booking displays
```typescript
// BEFORE:
booking.venue_id  // Direct reference
booking.assignments  // Array of assignments

// AFTER:
booking.teamup_id  // Nullable UUID
booking.timeslot.court.venue_id  // Derived via chain
booking.court  // NEW: Direct court info
booking.teamup  // NEW: TeamUp info if applicable
```

## Next Steps

1. **Regenerate API client** - Run OpenAPI generator to create new TypeScript types
   ```bash
   cd packages/api-client
   npm run generate
   ```

2. **Update web app** - Update `apps/web/lib/api.ts` to use new TeamUpsApi

3. **Remove Event UI** - Remove all Event-related pages and components

4. **Update TeamUp UI** - Allow creating TeamUps without timeslot, add booking flow

5. **Test thoroughly** - Verify all CRUD operations work with new structure

## Files Modified

- ✅ `docs/openapi.yaml` - Main API specification (reduced from ~1224 lines to ~1073 lines)

## Validation

To validate the updated OpenAPI spec:
```bash
npx @openapitools/openapi-generator-cli validate -i docs/openapi.yaml
```

## API Version

Consider bumping the API version in `openapi.yaml`:
```yaml
info:
  title: Sports Meetup API
  version: 0.2.0  # Bump from 0.1.0 to indicate breaking changes
```
