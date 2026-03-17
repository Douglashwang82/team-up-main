# Team-Up Feature Inventory

Last updated: 2026-03-13

Companion PM/Journey view: docs/feature-inventory-pm.md

## 1) Mobile App Features

### Authentication & Account
- Login: apps/mobile/app/(auth)/login.tsx
- Signup: apps/mobile/app/(auth)/signup.tsx
- Onboarding: apps/mobile/app/(auth)/onboarding.tsx
- Profile tab: apps/mobile/app/(tabs)/profile.tsx
- Edit profile: apps/mobile/app/edit-profile.tsx

### Event Discovery & Navigation
- Home/chat entry screen: apps/mobile/app/index.tsx
- Event feed tab: apps/mobile/app/(tabs)/index.tsx
- Event details: apps/mobile/app/event/[id].tsx
- My events: apps/mobile/app/my-events.tsx
- Create event flow: apps/mobile/app/(tabs)/event-create.tsx
- Create event modal: apps/mobile/app/event-create-modal.tsx
- Venue details: apps/mobile/app/venue/[id].tsx
- User profile details: apps/mobile/app/user/[id].tsx

### Map & Location
- Map tab screen: apps/mobile/app/(tabs)/map.tsx
- Map route screen: apps/mobile/app/map.tsx

### AI Chat + Widgets
- Chat screen integration: apps/mobile/app/index.tsx
- Chat hook/state + API calls: apps/mobile/hooks/useAIChat.ts
- Event list widget: apps/mobile/components/chat/widgets/EventListWidget.tsx
- Map widget: apps/mobile/components/chat/widgets/MapWidget.tsx
- Create event widget: apps/mobile/components/chat/widgets/CreateEventWidget.tsx
- Matched users widget: apps/mobile/components/chat/widgets/MatchedUsersWidget.tsx

## 2) Backend API Features

### App Composition & Enabled Modules
- App bootstrap + blueprint registration: services/api/app/__init__.py

### Health
- GET /health
- Implementation: services/api/app/routes/health.py

### Auth & Identity
- POST /auth/signup
- POST /auth/login
- POST /auth/refresh
- GET /auth/me
- PATCH /auth/me
- DELETE /auth/delete_account
- POST /auth/update_password
- Implementation: services/api/app/routes/auth.py

### User Domain
- GET /user/events
- GET /user/events/join_requests
- GET /user/events/join_requests/<request_id>
- DELETE /user/events/join_requests/<request_id>
- GET /user/bookings
- GET /user/info
- PUT /user/info
- GET /user/matchmaking
- Implementation: services/api/app/routes/user.py

### Events Domain
- POST /events
- PUT /events/<event_id>
- DELETE /events/<event_id>
- POST /events/<event_id>/book
- GET /events/<event_id>/bookings
- GET /events
- GET /events/<event_id>
- GET /events/my/created
- GET /events/my/joined
- GET /events/my/pending
- POST /events/<event_id>/join
- GET /events/<event_id>/join-requests
- POST /events/<event_id>/join-requests/<request_id>/review
- POST /events/<event_id>/split-bill
- PATCH /events/<event_id>/participants/<participant_id>/payment
- GET /events/owned
- POST /events/<event_id>/invite
- Implementation: services/api/app/routes/events.py

### Venues Domain
- GET /venues
- POST /venues
- GET /venues/<venue_id>
- PUT /venues/<venue_id>
- DELETE /venues/<venue_id>
- GET /venues/<venue_id>/courts/<court_id>
- PUT /venues/<venue_id>/courts/<court_id>
- DELETE /venues/<venue_id>/courts/<court_id>
- GET /venues/<venue_id>/courts/<court_id>/time_slots
- POST /venues/<venue_id>/courts/<court_id>/time_slots
- GET /venues/<venue_id>/courts/<court_id>/time_slots/<time_slot_id>
- PUT/PATCH /venues/<venue_id>/courts/<court_id>/time_slots/<time_slot_id>
- DELETE /venues/<venue_id>/courts/<court_id>/time_slots/<time_slot_id>
- Implementation: services/api/app/routes/venues.py

### Bookings Domain
- POST /bookings
- GET /bookings
- GET /bookings/<booking_id>
- PUT /bookings/<booking_id>
- PATCH /bookings/<booking_id>
- DELETE /bookings/<booking_id>
- Implementation: services/api/app/routes/bookings.py

### Notifications Domain
- GET /notifications
- POST /notifications/<notification_id>/read
- GET /notifications/<notification_id>
- DELETE /notifications/<notification_id>
- Implementation: services/api/app/routes/notifications.py

### AI Chat Domain
- GET /chat/messages
- POST /chat/messages
- DELETE /chat/messages
- Implementation: services/api/app/routes/chat.py

## 3) AI Assistant Memory Features

### LLM & Memory Logic
- Prompt orchestration + tool usage: services/api/app/core/llm.py
- Structured memory profile extraction fields:
  - preferred_sports
  - skill_levels
  - preferred_locations
  - preferred_time_slots
  - goals
  - constraints
  - budget_preferences
  - social_preferences
  - injury_notes
  - equipment_preferences
  - event_preferences
  - travel_preferences
- Memory rendering into compact prompt text: services/api/app/core/llm.py

### Persistence
- Chat messages table/model: services/api/app/models/chat_message.py
- Chat memory table/model: services/api/app/models/chat_memory.py
- Migration - add chat messages: services/api/alembic/versions/ad9fd37a3c02_add_chat_messages_table.py
- Migration - add chat memories: services/api/alembic/versions/b8f3f77f91aa_add_chat_memories_table.py
- Migration - add memory_profile JSONB: services/api/alembic/versions/c3f6b0b60d21_add_memory_profile_to_chat_memories.py

## 4) API Contract & Client

- OpenAPI source: docs/openapi.yaml
- Generated TS API client entry: packages/api-client/src/index.ts
- Generated APIs: packages/api-client/src/apis
- Generated models: packages/api-client/src/models

## 5) Tests Covering Key Features

- Chat history + memory behavior: services/api/tests/test_chat_history_context.py
- LLM history window + memory extraction: services/api/tests/test_llm_history_window.py
- Events: services/api/tests/test_events.py
- Venues: services/api/tests/test_venues.py
- Auth: services/api/tests/test_auth.py
- Bookings: services/api/tests/test_bookings.py
- Notifications: services/api/tests/test_notifications.py
- Matchmaking: services/api/tests/test_matchmaking.py
- Matching service: services/api/tests/test_matching_service.py

## 6) Notes

- This file is an implementation inventory (code-level), not a product requirement list.
- For endpoint details and request/response schemas, use docs/openapi.yaml and packages/api-client/src/models.
