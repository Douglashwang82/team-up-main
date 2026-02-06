# PostgreSQL with PostGIS for Railway

This directory contains the configuration to deploy PostgreSQL 16 with PostGIS 3.4 on Railway.

## What's Included

- **Dockerfile**: Based on official `postgis/postgis:16-3.4` image
- **railway.json**: Railway deployment configuration
- **DEPLOY.md**: Complete deployment guide

## Quick Start

See [DEPLOY.md](./DEPLOY.md) for full deployment instructions.

### Deploy to Railway

```bash
cd services/postgres
railway init
railway up
railway variables set POSTGRES_PASSWORD="$(openssl rand -hex 32)"
```

## Docker Image

Uses the official PostGIS Docker image:
- **Base**: PostgreSQL 16
- **PostGIS**: Version 3.4
- **Extensions**: postgis, btree_gist (auto-available)

This matches your local docker-compose setup for consistency.

## Default Configuration

```
POSTGRES_USER=postgres
POSTGRES_DB=team_up
POSTGRES_PASSWORD=<set-via-railway-variables>
```

## Local Testing

To test this locally with Docker:

```bash
docker build -t teamup-postgres .
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  --name teamup-db \
  teamup-postgres
```

Connect:
```bash
psql postgresql://postgres:postgres@localhost:5432/team_up
```

## Connecting from API

In your API service, set the DATABASE_URL:

```bash
# Using Railway private networking:
DATABASE_URL=postgresql://postgres:<password>@postgres.railway.internal:5432/team_up
```

Or use Railway's service reference syntax in the dashboard:
```
postgresql://postgres:${{Postgres.POSTGRES_PASSWORD}}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/team_up
```
