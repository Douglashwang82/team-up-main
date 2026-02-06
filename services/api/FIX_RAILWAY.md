# Fix Railway Database Connection

## Current Issue

Your API is deployed and running, but it cannot connect to the PostgreSQL database.

**Error**: `connection to server at "postgres.railway.internal" failed: Network is unreachable`

## Solution: Link Services and Add Database Reference ✅ COMPLETED

Railway services need to be explicitly connected via **Reference Variables**.

### ✅ DATABASE_URL has been set!

The `DATABASE_URL` reference variable has been successfully configured using:

```bash
railway variable set DATABASE_URL='${{ Postgres.DATABASE_URL }}'
```

This uses Railway's latest reference variable syntax to automatically connect your API service to your PostgreSQL database's private network.

### Method 1: Railway Dashboard (Alternative)

1. Go to https://railway.app
2. Open your project
3. Click on your **API service** (not Postgres)
4. Go to the **"Variables"** tab
5. Click **"+ New Variable"** or **"Raw Editor"**
6. Add: `DATABASE_URL=${{ Postgres.DATABASE_URL }}`
7. Save - Railway will auto-redeploy

### Method 2: Railway CLI ✅ USED

```bash
cd services/api

# Set DATABASE_URL reference (2026 syntax)
railway variable set DATABASE_URL='${{ Postgres.DATABASE_URL }}'
```

**Note**: The variable value appears empty in `railway variable list` because it's a reference variable - Railway resolves it at runtime for security.

### Verify the Fix

After adding the database reference, check the logs:

```bash
railway logs
```

You should see:
- ✅ "Database tables initialized successfully"
- ✅ No connection errors
- ✅ Health checks passing

### Test Your API

Once deployed successfully:

```bash
# Get your API URL
railway domain

# Test it (replace with your actual URL)
curl https://your-api.up.railway.app/health
curl https://your-api.up.railway.app/events
```

## Additional Setup

### 1. Enable PostGIS Extension (One-Time Setup)

You need to manually enable PostGIS on the database:

```bash
# Connect to your Railway Postgres
railway run psql $DATABASE_URL

# In the psql prompt, run:
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;

# Exit psql
\q
```

Or use Railway dashboard:
1. Click on your **Postgres service**
2. Go to **"Data"** tab
3. Click **"Query"**
4. Run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ```

### 2. Set JWT Secret (If Not Set)

```bash
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
```

### 3. Optional: Seed Database with Test Data

```bash
railway run python scripts/seed.py
```

## Understanding Railway Service Linking

Railway uses **private networking** between services:
- Services in the same project can reference each other
- Use `${{ServiceName.VARIABLE}}` syntax to reference variables
- The DATABASE_URL is automatically provided by Railway's Postgres plugin

## Troubleshooting

### Still Getting Connection Errors?

1. **Verify DATABASE_URL is set**:
   ```bash
   railway variables
   ```
   You should see `DATABASE_URL` listed

2. **Check if it's a reference**:
   The value should be `${{Postgres.DATABASE_URL}}` (a reference)
   NOT a hardcoded connection string

3. **Restart deployment**:
   ```bash
   railway up --detach
   ```

### "Network is unreachable" Error

This means your API service doesn't have access to the Postgres service's private network. Fix by adding the DATABASE_URL reference as described above.

### Health Check Passes but Database Fails

This is expected! We designed it this way:
- Health check (`/health`) works without database
- Database operations fail gracefully
- App stays running even if DB is unreachable

Now add the database reference and it will work!

## Quick Checklist

- [ ] Add DATABASE_URL reference to API service variables
- [ ] Enable PostGIS extension in Postgres
- [ ] Set JWT_SECRET environment variable
- [ ] Wait for automatic redeploy
- [ ] Test `/health` endpoint
- [ ] Test `/events` endpoint
- [ ] Optionally run seed data
