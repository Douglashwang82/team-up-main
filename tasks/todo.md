# Event Card Pending State Fix

## Plan
- [x] Understand how `event.user_join_status` or pending requests are passed to `EventCard.tsx`.
- [x] If the backend currently passes `event.requests`, check if the current user has a `submitted` or `pending` request in `EventCard.tsx`.
- [x] Optionally, fix the backend to return `user_join_status` if it isn't currently returning it, or fix `EventCard.tsx` to compute it from `requests`.
- [x] Verify that an event that has a pending request shows "Pending" in the `EventCard`.

## Review
- [x] Pending state is correctly displayed

## Lessons
- [x] API client and docker rebuilds

## Search Bar Styling update
- [x] Read `LiquidSearchBar.tsx` and understand current styling
- [x] Understand overall style of `index.tsx` (GridBackground, WarmBubbleBackground, LinearGradient, GlassView)
- [x] Update `LiquidSearchBar.tsx` or `index.tsx` search section to match index overall style
- [x] Verify aesthetic on iOS/Android
- [x] Fix list clipping and animation overlap
- [x] Integrate safe area padding correctly
- [x] Animations work well
- [x] Make Suggestions List overlay match the warm aesthetic
- [x] Hook Suggestions List taps to auto-fill search input

## Review Search Bar
- [x] Matches index styles
- [x] Animations work well

## Search Filter Modal
- [x] Add list-icon button next to search bar
- [x] Create filter modal UI (datetime, division [中正區, 萬華區, etc.], sport categories)
- [x] Implement filter state logic
- [x] Hook up filters with the backend API or client-side filtering

## Railway Deployment
- [x] Check if Railway CLI is installed and logged in.
- [x] Initialize Railway project for `services/api`.
- [x] Add PostgreSQL plugin to the project on Railway.
- [x] Enable PostGIS and btree_gist extensions on the Railway Postgres.
- [x] Set Environment Variables (`JWT_SECRET`, `BOOTSTRAP_DB=0`).
- [x] Deploy the API using `railway up`.
- [x] Set `BOOTSTRAP_DB=1` and run custom bootstrap script.
- [x] Restore Seed data to railway database using `SEED_DB=1` and sql dump
- [x] Get Railway domain and update `apps/mobile/lib/apiClient.ts` to use it (optional depending on frontend deployment).

## Review Railway Deployment
- [x] Database is successfully provisioned on Railway
- [x] PostGIS and extensions are enabled
- [x] Backend API is deployed and accessible publicly
- [x] Seed data has been properly loaded into the remote database (confirmed via API call)
- [x] Frontend is using `EXPO_PUBLIC_API_URL` environment variables for connection

## Lessons (Railway Deployment)
- [x] When seeding the database containing `COPY ... stdin` statements, `psycopg2.execute()` will fail. It's necessary to use `psql` locally or remotely via `os.system` or by sshing into the server.
- [x] Added `postgresql-client` to `aptPkgs` in `nixpacks.toml` so the container has `psql` available for the initialization script.
- [x] Railway's public port for databases might block local connections or timeout. The most reliable way to seed data is to deploy the seed file and execute it within the Railway environment using the internal `DATABASE_URL`.
