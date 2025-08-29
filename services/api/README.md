# Flask API (Sprint 1, v2)
MVP-ready Flask REST API for the Sports Meetup project, with Dockerfile and docker-compose.

## Run via Docker Compose (recommended)
```bash
docker compose up --build
# API available at: http://localhost:8080
```
This launches:
- **db**: Postgres 16 + PostGIS
- **api**: Flask app served by Gunicorn

## Run locally without Docker
1) Ensure Postgres 15+ + PostGIS and create DB `sportsmeet`.
2) Copy `.env.example` -> `.env` and adjust if needed.
3) Create venv and install deps:
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export $(cat .env | xargs 2>/dev/null)  # macOS/Linux only
FLASK_RUN_PORT=8080 flask --app app:create_app run --debug
# Or production-like:
gunicorn -w 2 -b 0.0.0.0:8080 'wsgi:app'
```

## Smoke Tests
```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/auth/signup -H 'Content-Type: application/json'   -d '{"email":"a@b.com","password":"p@ssw0rd","display_name":"Alex"}'
curl -G http://localhost:8080/events --data-urlencode lat=25.04 --data-urlencode lng=121.56 --data-urlencode radius=5
curl -X POST http://localhost:8080/events -H 'Content-Type: application/json'   -d '{"title":"Basketball 5v5","sport":"basketball","starts_at":"2025-08-27T19:00:00+08:00","ends_at":"2025-08-27T21:00:00+08:00","capacity":10,"lat":25.033,"lng":121.565,"address":"Taipei"}'
```

## Env Vars
- `DATABASE_URL`: Postgres DSN (Docker uses `db` host; local uses `localhost`)
- `JWT_SECRET`: token signing secret
- `BOOTSTRAP_DB`: `1` to auto ensure PostGIS + create tables on boot
- `FLASK_RUN_PORT`: default `8080`


# API v3 Changes
- JWT auth decorator (`app/core/auth.py`)
- New: GET /auth/me
- Events:
  - POST /events (Bearer required, sets host_id)
  - POST /events/{id}/join (Bearer required, capacity check, dedupe)
  - DELETE /events/{id}/leave (Bearer required)
  - GET /events/{id} (single)
  - GET /events supports limit/offset and returns attending count
