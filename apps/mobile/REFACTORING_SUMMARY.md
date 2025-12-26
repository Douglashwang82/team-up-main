# Mobile App Refactoring Summary

## Overview

The Team-Up mobile app has been refactored to align with the updated Flask backend API. This document summarizes the changes made and provides guidance for completing the refactoring.

## Completed Changes

### 1. TypeScript Types (`lib/types.ts`)

Created comprehensive TypeScript types matching the refactored API:

- **Auth Types**: `SignupRequest`, `LoginRequest`, `AuthResponse`, `User`
- **Event Types**: `Event`, `EventDetails`, `EventParticipant`, `EventJoinRequest`, etc.
- **Venue Types**: `Venue`, `Court`, `TimeSlot`, `VenueResult`
- **Booking Types**: `Booking`, `BookingDetails`, `EventBooking`
- **Ticket Types**: `Ticket`, `CreateTicketRequest`
- **Notification Types**: `Notification`

### 2. New API Client (`lib/apiClient.ts`)

Created a direct integration with the Flask backend:

**Key Features:**
- Direct `fetch` integration (no external SDK dependency)
- Automatic token refresh on 401 errors
- Comprehensive error handling
- Token management utilities

**API Modules:**
- `authApi`: signup, login, refresh, getCurrentUser, updateCurrentUser
- `eventsApi`: create, list, search, get, update, delete, join, listJoinRequests, reviewJoinRequest, bookTimeSlot, listBookings
- `venuesApi`: search, get, getCourtTimeSlots
- `bookingsApi`: create, list, get, update, cancel
- `ticketsApi`: create, list
- `notificationsApi`: list, markAsRead
- `healthApi`: check

### 3. Updated AuthContext (`lib/AuthContext.tsx`)

Refactored to use the new API client:

- Uses new `apiClient` instead of old SDK
- Updated signup to use `display_name` instead of separate first/last names
- Added `refreshUser` method for updating user data
- Improved error handling

### 4. Updated Signup Screen (`app/(auth)/signup.tsx`)

- Updated to combine first and last name into `display_name`
- Improved error handling to show specific error messages

### 5. New Event Components

**EventCard Component** (`components/EventCard.tsx`):
- Renamed from `TeamUpCard`
- Uses new `Event` type from `lib/types`
- Updated routing to `/event/[id]`
- Uses API field names (`current_participants`, `max_participants`, etc.)

**Events List Screen** (`app/(tabs)/events.tsx`):
- New implementation with real API integration
- Features:
  - Load events from API
  - Search functionality
  - Pull-to-refresh
  - Loading and error states
  - Empty state with call-to-action

**Event Details Screen** (`app/event/[id].tsx`):
- Complete implementation with real API integration
- Features:
  - Load event details with participants and bookings
  - Join event functionality
  - Display participants list with owner badge
  - Show venue bookings if available
  - Owner vs participant vs visitor states

## API Changes Summary

### Authentication
- ✅ Endpoint: `/auth/signup` - Updated to use `display_name`
- ✅ Endpoint: `/auth/login` - Working with new schema
- ✅ Endpoint: `/auth/me` - Returns user profile
- ✅ Token refresh mechanism implemented

### Events
- ✅ `POST /events` - Create event
- ✅ `GET /events` - List events with filters
- ✅ `GET /events/search` - Search events by keyword
- ✅ `GET /events/{id}` - Get event details
- ✅ `PUT /events/{id}` - Update event
- ✅ `DELETE /events/{id}` - Delete event
- ✅ `POST /events/{id}/join` - Join event
- ✅ `GET /events/{id}/join-requests` - List join requests
- ✅ `POST /events/{id}/join-requests/{requestId}/review` - Review join request
- ✅ `POST /events/{id}/book` - Book time slot for event
- ✅ `GET /events/{id}/bookings` - List event bookings

## Remaining Tasks

### High Priority

1. **Update Navigation Routes**
   - Update `app/(tabs)/_layout.tsx` to use correct tab names
   - Rename files from `teamup/*` to `event/*`
   - Update all route references from `/(tabs)/teamup/` to `/event/`

2. **Implement My Events Screen**
   - File: `app/(tabs)/my-events.tsx`
   - Show events owned by or joined by the user
   - Allow managing join requests (for owners)

3. **Implement Create Event Screen**
   - File: `app/(tabs)/new-event.tsx`
   - Form to create new events
   - Fields: title, description, max_participants, visibility, duration_type

4. **Update Notifications Component**
   - File: `components/NotificationCenter.tsx`
   - Integrate with `/notifications` endpoint
   - Handle match notifications
   - Mark as read functionality

5. **Implement Tickets Screen**
   - File: `app/(tabs)/tickets.tsx`
   - Create tickets for matching
   - View ticket status

6. **Implement Map/Venues Screen**
   - File: `app/(tabs)/map.tsx`
   - Show venues on map
   - Search venues by location
   - Filter by sport type and datetime

### Medium Priority

7. **Update Profile Screen**
   - File: `app/(tabs)/profile.tsx`
   - Show user info
   - Allow editing display name
   - Logout functionality

8. **Implement Field/Venue Details**
   - File: `app/field/[id].tsx`
   - Rename to `app/venue/[id].tsx`
   - Show venue details and available time slots
   - Book time slots

### Low Priority

9. **Remove Old API Client**
   - Remove `lib/api.ts` (old SDK-based client)
   - Remove `@team-up-main/api-client` dependency from package.json

10. **Update README**
    - Update `apps/mobile/README.md` with new API integration details
    - Update terminology from "TeamUp" to "Event"

## File Renaming Checklist

### Completed
- ✅ `components/TeamUpCard.tsx` → `components/EventCard.tsx`

### TODO
- ⬜ `app/(tabs)/my-teamups.tsx` → `app/(tabs)/my-events.tsx`
- ⬜ `app/(tabs)/new-teamup.tsx` → `app/(tabs)/new-event.tsx`
- ⬜ `app/teamup/[id].tsx` → `app/event/[id].tsx` (delete old, keep new)
- ⬜ `app/(tabs)/index.tsx` → `app/(tabs)/events.tsx` (or replace content)

## Testing Checklist

### Authentication
- ⬜ Sign up with new account
- ⬜ Login with existing account
- ⬜ Token refresh on 401
- ⬜ Logout and clear tokens
- ⬜ View and update profile

### Events
- ⬜ List events
- ⬜ Search events
- ⬜ View event details
- ⬜ Create event
- ⬜ Update event (as owner)
- ⬜ Delete event (as owner)
- ⬜ Join event
- ⬜ View join requests (as owner)
- ⬜ Approve/reject join requests (as owner)

### Venues & Bookings
- ⬜ Search venues by location
- ⬜ View venue details
- ⬜ View time slots
- ⬜ Create booking
- ⬜ View my bookings
- ⬜ Cancel booking
- ⬜ Book time slot for event

### Tickets & Matching
- ⬜ Create ticket
- ⬜ View tickets
- ⬜ Receive match notifications
- ⬜ Auto-join matched events

### Notifications
- ⬜ View notifications
- ⬜ Mark as read
- ⬜ Navigate to related events

## Configuration

### Environment Variables

Update `.env` or `app.config.js`:

```
EXPO_PUBLIC_API_URL=http://localhost:8080
```

For production:
```
EXPO_PUBLIC_API_URL=https://your-api-domain.com
```

### Platform-Specific URLs

The API client automatically uses:
- iOS Simulator: `http://localhost:8080`
- Android Emulator: `http://10.0.2.2:8080`
- Production: `EXPO_PUBLIC_API_URL` environment variable

## Breaking Changes

1. **Signup API Change**
   - Old: `{ email, password, firstName, lastName }`
   - New: `{ email, password, display_name }`

2. **Event Model Changes**
   - `currentParticipants` → `current_participants`
   - `maxParticipants` → `max_participants`
   - `createdAt` → `created_at`
   - Added: `owner_user_id`, `updated_at`

3. **Route Changes**
   - `/teamup/[id]` → `/event/[id]`
   - `/my-teamups` → `/my-events`
   - `/new-teamup` → `/new-event`

## Next Steps

1. **Immediate**: Complete the file renaming and route updates
2. **Short-term**: Implement My Events and Create Event screens
3. **Medium-term**: Implement Tickets, Notifications, and Map screens
4. **Long-term**: Add advanced features like real-time updates, push notifications

## Notes

- The old `api.ts` file using the SDK can be removed once all screens are updated
- All API responses now use snake_case field names (Flask default)
- The new API client handles authentication automatically via interceptors
- Error handling is improved with specific error messages from the backend

## Support

For issues or questions:
- Check the API Documentation: `services/api/API_DOCUMENTATION.md`
- Review the backend code: `services/api/app/routes/`
- Check mobile types: `apps/mobile/lib/types.ts`
