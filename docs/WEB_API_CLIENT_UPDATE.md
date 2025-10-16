# Web API Client Updates - Completed

## Summary
Updated the web API client (`apps/web/lib/api.ts`) to reflect the simplified architecture by removing Event references and preparing for the regenerated TeamUpsApi.

## ✅ Changes Made to `apps/web/lib/api.ts`

### 1. Updated Imports (lines 11-19)
**Before:**
```typescript
import {
  Configuration,
  AuthApi, EventsApi, HealthApi,  // EventsApi included
  VenuesApi,
  // TeamUpsApi, // TODO: Uncomment when TeamUps API is generated
} from '@team-up-main/api-client';
```

**After:**
```typescript
import {
  Configuration,
  AuthApi, HealthApi,  // EventsApi removed
  VenuesApi,
  TeamUpsApi,  // Now active
} from '@team-up-main/api-client';
```

### 2. Updated File Header Comment (lines 4-9)
Changed from mentioning EventsApi to TeamUpsApi as the primary API example.

### 3. Simplified APIs Export (lines 114-119)
**Before:**
```typescript
export const apis = {
  auth: new AuthApi(config),
  events: new EventsApi(config),  // ❌ Removed
  health: new HealthApi(config),
  venues: new VenuesApi(config),
  // Mock teamups object with 8 placeholder methods
  teamups: {
    getTeamUps: async (params?: any) => { ... },
    // ... 40+ lines of mock code
  } as any,
};
```

**After:**
```typescript
export const apis = {
  auth: new AuthApi(config),
  health: new HealthApi(config),
  venues: new VenuesApi(config),
  teamups: new TeamUpsApi(config),  // ✅ Real API
};
```

### 4. Updated Example Comment (line 122)
Changed from `apis.events.listAllEvents()` to `apis.teamups.listTeamUps()`

## Impact

**Lines Removed**: ~50 lines (mock TeamUps API removed)
**Breaking Changes**: Yes - `apis.events` is no longer available
**Migration Needed**: Yes - frontend code using `apis.events` must be updated

## 🔄 Next Steps

### 1. Regenerate API Client Package
The web API client file is now ready, but the TypeScript types need to be regenerated from the updated OpenAPI spec:

```bash
# Navigate to API client package
cd packages/api-client

# Regenerate TypeScript types from OpenAPI spec
npm run generate

# This will:
# - Read docs/openapi.yaml
# - Generate new TypeScript interfaces and API classes
# - Create TeamUpsApi class
# - Remove EventsApi class
# - Update all schemas
```

### 2. Update Frontend Code
After regenerating the API client, update all frontend code that references Events:

#### Files Likely to Need Updates:
```bash
# Search for Event-related code in the web app
cd apps/web
grep -r "apis.events" src/
grep -r "EventsApi" src/
grep -r "EventOut" src/
grep -r "EventCreateIn" src/
```

#### Common Patterns to Replace:

**Event Creation:**
```typescript
// ❌ OLD - Remove this
await apis.events.createEvent({
  createEventRequest: {
    title: "...",
    court_timeslot_id: "uuid"
  }
});

// ✅ NEW - Use TeamUp + Booking flow
const teamup = await apis.teamups.createTeamUp({
  teamUpCreateIn: {
    title: "...",
    min_participants: 4,
    max_participants: 10,
    visibility: "public"
  }
});

// Then book timeslot separately
await apis.teamups.bookTimeslotForTeamup({
  id: teamup.id,
  teamUpBookingIn: {
    timeslot_id: "uuid"
  }
});
```

**Event Listing:**
```typescript
// ❌ OLD
const events = await apis.events.listAllEvents({ limit: 20 });

// ✅ NEW
const teamups = await apis.teamups.listTeamUps({ limit: 20 });
```

**Event Details:**
```typescript
// ❌ OLD
const event = await apis.events.getEventById({ id: "uuid" });
console.log(event.court_timeslot);  // Single timeslot

// ✅ NEW
const teamup = await apis.teamups.getTeamUpById({ id: "uuid" });
console.log(teamup.bookings);  // Array of bookings
```

**Joining:**
```typescript
// ❌ OLD
await apis.events.joinEvent({ id: "uuid", joinEventRequest: {} });

// ✅ NEW
await apis.teamups.joinTeamUp({ id: "uuid", joinTeamUpRequest: {} });
```

### 3. Update UI Components

Remove or update these likely component types:
- `EventCard` → `TeamUpCard`
- `EventDetail` → `TeamUpDetail`
- `EventList` → `TeamUpList`
- `CreateEventForm` → `CreateTeamUpForm`
- `EventParticipants` → `TeamUpParticipants`

Update display logic for:
- TeamUps no longer have a single required timeslot
- TeamUps can have 0 or more bookings
- Booking details now include `court`, `venue`, and `teamup` objects

### 4. Update Routing

Remove Event-related routes:
```typescript
// ❌ Remove routes like:
/events
/events/create
/events/:id
/events/:id/join
/events/:id/participants
```

Keep/update TeamUp routes:
```typescript
// ✅ Keep routes like:
/teamups
/teamups/create
/teamups/:id
/teamups/:id/join
/teamups/:id/participants
/teamups/:id/bookings  // NEW - show all bookings for a TeamUp
```

### 5. Validation Commands

After all updates, verify the changes:

```bash
# TypeScript compilation check
cd apps/web
npm run build

# Look for type errors related to missing EventsApi
# If build succeeds, all Event references have been removed

# Runtime testing
npm run dev
# Test all TeamUp flows:
# - Create TeamUp (without timeslot)
# - Book timeslot for TeamUp
# - View TeamUp details (should show bookings array)
# - Join TeamUp
# - View participants
```

## Files Modified

- ✅ `apps/web/lib/api.ts` - Updated imports and exports (reduced from 162 to ~120 lines)

## Migration Checklist for Frontend Team

- [ ] Regenerate API client: `cd packages/api-client && npm run generate`
- [ ] Search for all `apis.events` usage and replace with `apis.teamups`
- [ ] Update Event components to TeamUp components
- [ ] Update routing (remove Event routes)
- [ ] Update forms (TeamUp creation no longer requires timeslot)
- [ ] Update detail views (show bookings array instead of single timeslot)
- [ ] Update booking flows (add ability to book multiple timeslots for a TeamUp)
- [ ] Test all CRUD operations
- [ ] Verify type safety (no TypeScript errors)

## Expected Benefits

1. ✅ **Simpler API surface** - 4 main APIs instead of 5 (removed events)
2. ✅ **Cleaner code** - No more mock TeamUps API
3. ✅ **Type safety** - Real TypeScript types from OpenAPI spec
4. ✅ **Consistency** - Web app now matches backend architecture
5. ✅ **Flexibility** - TeamUps can exist without timeslots, can book multiple sessions

## Support

If you encounter issues during migration:

1. Check `docs/OPENAPI_UPDATES.md` for API changes
2. Check `REFACTORING_COMPLETED.md` for backend model changes
3. Verify API client regeneration succeeded
4. Check TypeScript compiler errors for migration hints
