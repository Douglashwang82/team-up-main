# Team-Up Deployment Runbook

Last updated: 2026-03-13

This runbook is for deploying Team-Up so real users can use it.

## Scope
- Backend API: Railway
- Database: Railway PostgreSQL + PostGIS
- Mobile app: Expo EAS (Android internal + iOS TestFlight)

## 0. Prerequisites

- Railway CLI installed
- Expo CLI and EAS CLI installed
- Apple Developer account (for iOS TestFlight)
- Google Play Console account (for Android internal testing)

Install CLIs:

- npm install -g @railway/cli
- npm install -g eas-cli expo

## 1. Backend Deploy (Railway)

### 1.1 Login and select project/service

From services/api:

- railway login
- railway status
- railway service status

If needed, link to project/service:

- railway link

### 1.2 Validate required Railway variables

List variables:

- railway variable list

Required in API service:

- DATABASE_URL
- JWT_SECRET
- BOOTSTRAP_DB

Set safe defaults:

- railway variable set JWT_SECRET=$(openssl rand -hex 32)
- railway variable set BOOTSTRAP_DB=0

Important: DATABASE_URL should be a Railway reference variable to your actual Postgres service.

Example format:

- railway variable set DATABASE_URL='${{ Postgres-dbDS.DATABASE_URL }}'

(Use your real PostgreSQL service name from railway status.)

### 1.3 Deploy API

- railway up --detach
- railway service status
- railway logs --follow

Get public API domain:

- railway domain

### 1.4 One-time DB setup

1) Enable PostGIS in Railway DB (dashboard query tab):

- CREATE EXTENSION IF NOT EXISTS postgis;
- CREATE EXTENSION IF NOT EXISTS btree_gist;

2) Align and apply migrations from API service shell:

- railway run alembic heads
- railway run alembic current
- railway run alembic upgrade head

If schema already exists but alembic is behind (duplicate column/table errors), use stamp to sync:

- railway run alembic stamp c3f6b0b60d21
- railway run alembic upgrade head

3) After successful startup, enable bootstrap for future deploys:

- railway variable set BOOTSTRAP_DB=1

### 1.5 Optional seed data

- railway run python scripts/seed.py

## 2. Backend Smoke Tests

Replace API_URL with your Railway domain.

- curl API_URL/health
- curl -X POST API_URL/auth/signup -H "Content-Type: application/json" -d '{"email":"deploy_test@example.com","password":"password123","display_name":"Deploy Test"}'
- curl API_URL/events

Expected:
- health returns status ok
- signup returns access_token and refresh_token
- events endpoint responds without 500

## 3. Mobile App Release (Expo EAS)

## 3.1 Configure production API URL

In apps/mobile build environment, set:

- EXPO_PUBLIC_API_URL=API_URL

Where API_URL is your Railway API domain.

Do not use localhost in production builds.

### 3.2 Create EAS config (if missing)

If apps/mobile/eas.json does not exist, run:

- cd apps/mobile
- eas build:configure

### 3.3 Build Android internal testing

From apps/mobile:

- eas login
- eas build -p android --profile preview

Upload resulting AAB/APK to Google Play internal track.

### 3.4 Build iOS TestFlight

From apps/mobile:

- eas build -p ios --profile preview

Submit build to TestFlight.

### 3.5 Promote to production

After QA sign-off:

- Android: promote internal -> production in Play Console
- iOS: submit approved TestFlight build to App Store release

## 4. Production Safety Checklist

- Rotate exposed map keys and restrict by app package/bundle + API restrictions.
- Set strict CORS origins in API (avoid wildcard).
- Confirm alembic_version is latest head.
- Verify /chat/messages, /notifications, /events work with real auth tokens.
- Set monitoring and alerting on Railway.

## 5. Rollback Plan

### API rollback

- railway service status
- railway logs
- railway service redeploy

If a migration caused issues:

- restore DB backup/snapshot
- run alembic stamp to known good revision
- redeploy previous known-good commit

### Mobile rollback

- Android: halt rollout and re-promote last stable release
- iOS: remove problematic phased release and submit prior stable binary

## 6. Ownership

- Backend release owner: API engineer
- Mobile release owner: mobile engineer
- Final go/no-go: product + QA

## 7. Useful Repo References

- services/api/RAILWAY_DEPLOY.md
- services/api/DEPLOYMENT.md
- services/api/DEPLOY_CLI.md
- services/api/railway.json
- apps/mobile/app.json
- docs/feature-inventory-pm.md
