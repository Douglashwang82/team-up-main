# Plan: Web Application Feature Parity

- [x] Auth: Implement signup and login pages in `apps/web/app/(auth)`.
- [x] Auth: Add `me` profile view and update.
- [/] Events: Implement `teamups` listing page with filters.
- [x] Events: Implement event creation flow.
- [/] Events: Implement event detail page (`/teamups/[id]`).
- [/] Events: Implement join request flow and owner review logic.
- [x] Venues: Implement venue discovery page (`/venues`).
- [x] Venues: Implement venue details and court time slot selection.
- [x] Bookings: Implement booking flow for event owners.
- [x] Notifications: Add a notification hub or dropdown to view messages/alerts.
- [x] UI/UX Polish: Enhance layout structure and navigation.
- [/] Final Review: Verify all requirements against `API_DOCUMENTATION.md` and check for responsive design issues.


---
# Plan: Smart Schedule - Calendar View

- [x] Add `react-native-calendars` dependency to `apps/mobile/package.json`.
- [x] Refactor `apps/mobile/app/my-events.tsx` to include a Calendar View.
- [x] Add a toggle (List / Calendar) in the header of `my-events.tsx`.
- [x] Implement `Calendar` component mapping `upcomingEvents` and `completedEvents` strictly to their dates.
- [x] Hide filter chips when in Calendar View.
- [x] Wait for user review on the initial layout and style.

---
# Plan: Feature 2 - Automated Split Billing (無痛自動分帳)

- [x] Backend: Check database schema. (`amount_due` and `payment_status` are already present in `EventParticipant`!)
- [x] Backend: Create API endpoint `POST /api/v1/events/{event_id}/split-bill` to split amount evenly among joined participants.
- [x] Backend: Create API endpoint `PATCH /api/v1/events/{event_id}/participants/{participant_id}/payment` to toggle `payment_status`.
- [x] Frontend: Add 【結算分帳】 button in `event/[id].tsx` (visible only to owner).
- [x] Frontend: Check if we are using manual form or AI natural language for inputting amounts.
- [x] Frontend: Update participant list in Event detail to show `payment_status` tags and allow owner to toggle them.
- [ ] Verification: Test split bill feature manually.

---
# Plan: AI Chat Assistant Tab
- [x] Add `chat` screen to `apps/mobile/app/(tabs)/_layout.tsx`.
- [x] Create UI for `apps/mobile/app/(tabs)/chat.tsx` (message list & input bar).
- [x] Create `useAIChat.ts` hook for message state management.
- [x] Implement smooth scroll-to-bottom behavior for the chat list.
- [x] Wait for user review on the initial architecture and mock approach.

---
## Archive: Database Schema Updates for Venues & Courts

- [x] Update `Venue` model with `management_type` and `external_booking_url` in `app/models/venue.py`.
- [x] Update `Court` model with `environment`, `surface_type`, and `metadata_` in `app/models/venue.py`.
- [x] Update `Booking` model with `amount_paid` and `currency` in `app/models/booking.py`.
- [x] Update Pydantic schemas in `app/schemas/venue.py` and `app/schemas/booking.py`.
- [x] Generate Alembic migration script.
- [x] Run `pytest` for venues and bookings to ensure everything works.
- [x] Apply migration locally and test API endpoints.
