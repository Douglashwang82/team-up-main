# Web App Refactoring Progress

## Completed Tasks ✓

### 1. Infrastructure Setup
- ✓ Created route groups: `(auth)` and `(main)`
- ✓ Created root `app/layout.tsx` with AuthProvider
- ✓ Created `middleware.ts` for route protection
- ✓ Created `(auth)/layout.tsx` for centered auth pages
- ✓ Created `(main)/layout.tsx` with Navbar

### 2. Authentication Context
- ✓ Created `lib/contexts/AuthContext.tsx`
  - User state management
  - login(), signup(), logout() functions
  - Token storage in cookies
  - Auto-redirect handling

### 3. Custom Hooks (API Client)
- ✓ Created `lib/hooks/useAuth.ts` - Auth context wrapper
- ✓ Created `lib/hooks/useVenues.ts` - Venue search and detail
  - useVenues(params) - Search with geolocation
  - useVenue(venueId) - Single venue detail
  - useCourtTimeslots(venueId, courtId, date) - Available timeslots
- ✓ Created `lib/hooks/useBookings.ts` - Booking management
  - useBookings(status) - List user bookings
  - useBooking(bookingId) - Get/update/cancel booking
  - createBooking(timeslotId, teamupId) - Create new booking
- ✓ Created `lib/hooks/useTeamUps.ts` - TeamUp management
  - useTeamUps(params) - Browse TeamUps
  - useMyTeamUps() - User's TeamUps
  - useTeamUp(teamupId) - Single TeamUp detail
  - useJoinRequests(teamupId) - Join requests management
  - createTeamUp(), createJoinRequest(), reviewJoinRequest()

### 4. Refactored Routes

#### Auth Routes
- ✓ `(auth)/login/page.tsx` - Updated with useAuth hook
- ✓ `(auth)/signup/page.tsx` - Updated with useAuth hook

#### Venues Routes
- ✓ `(main)/venues/page.tsx` - Updated with useVenues hook

#### Bookings Routes
- ✓ `(main)/bookings/page.tsx` - NEW: List all user bookings
- ✓ `(main)/bookings/[bookingId]/page.tsx` - Updated booking detail

#### TeamUps Routes (Partially Complete)
- Directories created, but pages not yet migrated

## Remaining Tasks

### 1. Complete TeamUps Routes Migration

**Browse TeamUps** - `(main)/teamups/page.tsx`
- Update to use useTeamUps hook
- Remove obsolete fields (min_participants, deadline, court_timeslot_id, sport_type)
- Add filters for status, visibility
- Simplify UI

**My TeamUps** - `(main)/teamups/my/page.tsx`
- Update to use useMyTeamUps hook
- Remove tabs (created/joined) - API returns all user's TeamUps
- Update model structure

**Create TeamUp** - `(main)/teamups/new/page.tsx`
- Update to use createTeamUp function
- Remove venue/timeslot selection (not in new model)
- Keep: title, description, max_participants, visibility, durantion_type
- Remove: min_participants, deadline, sport_type, court_timeslot_id

**TeamUp Detail** - `(main)/teamups/[teamupId]/page.tsx`
- Read existing and update with useTeamUp hook
- Show participants, bookings
- Join button for non-participants
- Owner actions (edit, delete)

**Join Requests** - `(main)/teamups/[teamupId]/manage/requests/page.tsx`
- Move from /requests to /manage/requests
- Update with useJoinRequests hook
- Approve/reject functionality

### 2. Profile Routes

**Profile** - `(main)/profile/page.tsx`
- Read existing `user/profile/page.tsx`
- Update with useAuth hook
- Display user info

**Edit Profile** - `(main)/profile/edit/page.tsx`
- NEW: Edit user details

### 3. Missing Routes

**Venue Detail** - `(main)/venues/[venueId]/page.tsx`
- NEW: Show venue details
- List courts
- Show available timeslots

**Court Timeslots** - `(main)/venues/[venueId]/courts/[courtId]/timeslots/page.tsx`
- NEW: Show court availability
- Book timeslot button

**Create Booking** - `(main)/bookings/new/page.tsx`
- NEW: Create booking from venue/timeslot

**TeamUp Management** - `(main)/teamups/[teamupId]/manage/page.tsx`
- NEW: Owner dashboard
- Manage participants
- Link bookings

### 4. Shared Components

**UI Components** (from refactoring plan)
- Button, Input, Card, Modal
- Loading states, Error boundaries
- Form components

**Feature Components**
- TeamUpCard (extract from list pages)
- BookingCard (extract from list pages)
- ParticipantList
- JoinRequestList

### 5. Cleanup

- Delete old route files after migration
- Update Navbar links to new routes
- Test all routes with middleware
- Update SearchBar component for new API

## Model Changes to Note

### Old TeamUp Model (in existing pages)
```typescript
{
  min_participants: number;
  max_participants: number;
  deadline?: string;
  sport_type?: string;
  court_timeslot_id?: string;
  court_timeslot?: {...};
}
```

### New TeamUp Model
```typescript
{
  title: string;
  description?: string;
  owner_user_id: string;
  max_participants: number;
  current_participants: number;
  visibility: 'public' | 'private';
  durantion_type: 'temporary' | 'recurring';
  status: 'open' | 'closed' | 'cancelled';
  // No min_participants, deadline, sport_type, court_timeslot_id
}
```

### Key Differences
1. Removed `min_participants` - simplified
2. Removed `deadline` - not in new model
3. Removed `sport_type` - moved to court level
4. Removed `court_timeslot_id` - TeamUps are no longer tied to specific timeslots
5. Added `visibility` - public/private control
6. Added `durantion_type` - temporary/recurring
7. Status now: open/closed/cancelled (no 'confirmed')

## Next Steps

1. **Complete TeamUps migration** - Update all 5 TeamUp pages
2. **Add Profile routes** - Migrate and create profile pages
3. **Add missing Venue/Booking routes** - Create new detail pages
4. **Extract shared components** - Reduce code duplication
5. **Update Navbar** - Fix navigation links
6. **Clean up old files** - Remove old route directory

## File Structure

```
apps/web/app/
├── layout.tsx                          # ✓ Root with AuthProvider
├── page.tsx                            # ✓ Home page (untouched)
├── middleware.ts                       # ✓ Route protection
├── (auth)/
│   ├── layout.tsx                      # ✓ Centered auth layout
│   ├── login/page.tsx                  # ✓ Updated
│   └── signup/page.tsx                 # ✓ Updated
├── (main)/
│   ├── layout.tsx                      # ✓ Main layout with Navbar
│   ├── venues/
│   │   ├── page.tsx                    # ✓ Search venues
│   │   └── [venueId]/
│   │       ├── page.tsx                # TODO: Venue detail
│   │       └── courts/[courtId]/
│   │           └── timeslots/page.tsx  # TODO: Court timeslots
│   ├── bookings/
│   │   ├── page.tsx                    # ✓ My bookings list
│   │   ├── new/page.tsx                # TODO: Create booking
│   │   └── [bookingId]/
│   │       ├── page.tsx                # ✓ Booking detail
│   │       └── edit/page.tsx           # TODO: Edit booking
│   ├── teamups/
│   │   ├── page.tsx                    # TODO: Browse TeamUps
│   │   ├── new/page.tsx                # TODO: Create TeamUp
│   │   ├── my/page.tsx                 # TODO: My TeamUps
│   │   └── [teamupId]/
│   │       ├── page.tsx                # TODO: TeamUp detail
│   │       └── manage/
│   │           ├── page.tsx            # TODO: Manage overview
│   │           └── requests/page.tsx   # TODO: Review requests
│   └── profile/
│       ├── page.tsx                    # TODO: View profile
│       └── edit/page.tsx               # TODO: Edit profile
└── lib/
    ├── contexts/
    │   └── AuthContext.tsx             # ✓ Created
    └── hooks/
        ├── useAuth.ts                  # ✓ Created
        ├── useVenues.ts                # ✓ Created
        ├── useBookings.ts              # ✓ Created
        └── useTeamUps.ts               # ✓ Created
```
