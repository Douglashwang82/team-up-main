# Team-Up Feature Inventory (PM View)

Last updated: 2026-03-13

This document groups implemented features by user journey instead of code modules.

Deployment runbook: docs/deploy-runbook.md

## Roadmap Board (Now / Next / Later)

### Now (In Progress / Highest Priority)
- Add dedicated Inbox tab that combines notifications + invitations in one screen.
- Stabilize chat memory persistence/compaction behavior across app restarts and migration edge cases.
- Keep AI widgets visually consistent with event cards (matched users/widget parity).

### Next (Planned)
- Add invitation management UX in inbox: accept/reject actions and deep links to event details.
- Expand AI assistant memory profile usage in recommendation ranking (sports, time, distance, budget).
- Add product-level analytics events for key journeys: discover, join, host, and chat widget interactions.

### Later (Backlog)
- Web app feature parity for core mobile journeys.
- Real-time notification delivery (push/websocket) to replace polling-only inbox behavior.
- Team/league features (recurring events, standings, season management).

## 1. Discover

### Browse Activities
- View public event feed and cards
- Filter/search event lists
- Open event detail pages

Implemented in:
- apps/mobile/app/(tabs)/index.tsx
- apps/mobile/components/events/EventCard.tsx
- services/api/app/routes/events.py (GET /events, GET /events/<event_id>)

### Explore by Map
- Search venues and courts on map
- Navigate from map to venue details

Implemented in:
- apps/mobile/app/(tabs)/map.tsx
- apps/mobile/app/venue/[id].tsx
- services/api/app/routes/venues.py

## 2. Join

### Join Events
- Send join request for events
- View join status (pending/joined)
- Host review flow supported on backend

Implemented in:
- apps/mobile/components/events/EventCard.tsx
- apps/mobile/app/event/[id].tsx
- services/api/app/routes/events.py (POST /events/<event_id>/join, GET/POST join-requests)

### Invitations
- Invite users to owned events
- Receive invitation notifications

Implemented in:
- apps/mobile/app/user/[id].tsx
- services/api/app/routes/events.py (POST /events/<event_id>/invite)
- services/api/app/routes/notifications.py

## 3. Host

### Create & Manage Events
- Create event
- Edit/delete event
- Review participants and bookings

Implemented in:
- apps/mobile/app/(tabs)/event-create.tsx
- apps/mobile/app/event-create-modal.tsx
- apps/mobile/app/my-events.tsx
- services/api/app/routes/events.py (POST/PUT/DELETE /events, /my/* endpoints)

### Booking Integration
- Bind time slots to events
- List bookings under event

Implemented in:
- services/api/app/routes/events.py (/book, /bookings)
- services/api/app/routes/bookings.py

### Split Bill / Payment Tracking
- Split event bill among participants
- Mark participant payment status

Implemented in:
- services/api/app/routes/events.py (POST /split-bill, PATCH /participants/<id>/payment)

## 4. Manage Account

### Authentication
- Signup, login, refresh token

Implemented in:
- apps/mobile/app/(auth)/signup.tsx
- apps/mobile/app/(auth)/login.tsx
- services/api/app/routes/auth.py

### Profile & Preferences
- View/update personal profile
- Maintain preference fields used by matching

Implemented in:
- apps/mobile/app/(tabs)/profile.tsx
- apps/mobile/app/edit-profile.tsx
- services/api/app/routes/auth.py
- services/api/app/routes/user.py

## 5. AI Assistant

### Conversational Assistant
- Chat endpoint with tool-driven UI widget responses
- Event list/map/create-event/matched-users widgets

Implemented in:
- apps/mobile/app/index.tsx
- apps/mobile/hooks/useAIChat.ts
- apps/mobile/components/chat/widgets/EventListWidget.tsx
- apps/mobile/components/chat/widgets/MapWidget.tsx
- apps/mobile/components/chat/widgets/CreateEventWidget.tsx
- apps/mobile/components/chat/widgets/MatchedUsersWidget.tsx
- services/api/app/routes/chat.py
- services/api/app/core/llm.py

### Memory-Aware Personalization
- Per-user memory persistence in database
- Structured memory profile extraction for sports assistant context

Implemented in:
- services/api/app/models/chat_memory.py
- services/api/alembic/versions/b8f3f77f91aa_add_chat_memories_table.py
- services/api/alembic/versions/c3f6b0b60d21_add_memory_profile_to_chat_memories.py
- services/api/app/core/llm.py

## 6. Notifications & Inbox

### Notification Center
- Poll and display notifications
- Mark notification as read

Implemented in:
- apps/mobile/components/layout/NotificationCenter.tsx
- services/api/app/routes/notifications.py

## 7. Operational/Platform Features

### API Contract + Client Generation
- OpenAPI source and generated TypeScript client

Implemented in:
- docs/openapi.yaml
- packages/api-client/src/apis
- packages/api-client/src/models

### Local Dev + Data
- Dockerized API + Postgres/PostGIS
- Alembic migrations and seed flow

Implemented in:
- services/api/docker-compose.yml
- services/api/alembic/versions
- services/api/scripts/seed.py

## 8. Current Gaps to Track (Product)

- No dedicated full-page inbox tab combining notifications + invitations yet.
- Web app feature parity with mobile is partial.
- Some README docs are outdated vs actual implementation.
