# Deploy PostgreSQL + PostGIS on Railway

This guide shows you how to deploy your own PostgreSQL with PostGIS as a separate Railway service.

## Why Deploy Custom PostgreSQL?

Railway's managed PostgreSQL doesn't include PostGIS extensions. By deploying your own PostgreSQL container, you get:
- ✅ Full PostGIS support (required for geospatial features)
- ✅ Full control over PostgreSQL configuration
- ✅ Same image as your local docker-compose (postgis/postgis:16-3.4)

## Step-by-Step Deployment

### 1. Deploy the PostgreSQL Service

```bash
cd services/postgres
railway init  # Create a new project or link to existing
railway up    # Deploy the PostgreSQL service
```

**Important**: This will deploy PostgreSQL as a **separate service** from your API.

### 2. Set PostgreSQL Password

After deployment, set a secure password:

```bash
railway variables set POSTGRES_PASSWORD="$(openssl rand -hex 32)"
```

### 3. Get the Internal Connection Details

Railway services can connect to each other using private networking. Get your PostgreSQL connection details:

```bash
# View all environment variables
railway variables

# You'll need:
# - POSTGRES_USER (default: postgres)
# - POSTGRES_PASSWORD (the one you just set)
# - POSTGRES_DB (default: team_up)
```

### 4. Get the Private Service URL

In Railway Dashboard:
1. Go to your **PostgreSQL service**
2. Click **"Settings"** tab
3. Look for **"Private Network"** or **"Service Domain"**
4. Copy the internal hostname (e.g., `postgres.railway.internal`)

Alternatively, Railway automatically creates a variable called `RAILWAY_PRIVATE_DOMAIN` for each service.

### 5. Deploy Your API Service

Now go back to your API service:

```bash
cd ../api
railway link  # Link to the SAME project but different service
```

If you haven't created the API service yet:

```bash
railway init  # Make sure you select the SAME project as PostgreSQL
railway up
```

### 6. Configure API to Use PostgreSQL

Set the DATABASE_URL in your API service to point to your PostgreSQL service:

```bash
# If using Railway's private networking (recommended):
railway variables set DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@postgres.railway.internal:5432/team_up"

# Replace [YOUR_PASSWORD] with the actual password you set in step 2
```

**Tip**: You can reference the PostgreSQL password from the other service:
1. In Railway Dashboard → Your API Service → Variables
2. Add `DATABASE_URL` as a variable
3. Use the format: `postgresql://postgres:${{Postgres.POSTGRES_PASSWORD}}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/team_up`
   
   Where `Postgres` is the name of your PostgreSQL service in Railway.

### 7. Set Other Required Variables

```bash
# Set JWT secret
railway variables set JWT_SECRET="$(openssl rand -hex 32)"

# Enable database bootstrap (creates tables)
railway variables set BOOTSTRAP_DB="1"
```

### 8. Verify Deployment

Check the API logs:

```bash
railway logs
```

You should see:
- ✅ Database connection successful
- ✅ PostGIS extensions available
- ✅ Tables created
- ✅ Healthcheck passing

## Testing PostGIS

To verify PostGIS is working, connect to your PostgreSQL service:

```bash
cd services/postgres
railway run psql $DATABASE_URL

# Then run these SQL commands:
SELECT PostGIS_version();
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name IN ('postgis', 'btree_gist');
```

You should see PostGIS version info.

## Connecting Services

Railway provides two ways for services to communicate:

### Option A: Private Networking (Recommended)
- Faster and free
- Not exposed to internet
- Use internal hostnames like `postgres.railway.internal`
- Format: `postgresql://user:pass@postgres.railway.internal:5432/dbname`

### Option B: Public URL
- Exposed to internet (requires setting up public domain)
- Use for external connections
- Format: `postgresql://user:pass@postgres-production-xxxx.railway.app:5432/dbname`

For your API → PostgreSQL connection, **use private networking**.

## Project Structure

Your Railway project should have **2 services**:

1. **PostgreSQL Service** (`services/postgres/`)
   - Image: postgis/postgis:16-3.4
   - Environment: POSTGRES_PASSWORD, POSTGRES_USER, POSTGRES_DB
   - Private networking enabled

2. **API Service** (`services/api/`)
   - Python Flask app
   - Environment: DATABASE_URL (pointing to PostgreSQL service), JWT_SECRET, BOOTSTRAP_DB
   - Depends on PostgreSQL service

## Environment Variables Reference

### PostgreSQL Service
```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generated-secure-password>
POSTGRES_DB=team_up
```

### API Service
```bash
DATABASE_URL=postgresql://postgres:<password>@<postgres-service-url>:5432/team_up
JWT_SECRET=<generated-random-string>
BOOTSTRAP_DB=1
```

## Troubleshooting

### "Could not translate host name to address"
**Issue**: API can't find PostgreSQL service

**Fix**: Ensure both services are in the same Railway project and use the correct internal hostname.

### "PostGIS extension not found"
**Issue**: PostgreSQL doesn't have PostGIS

**Fix**: Make sure you deployed the postgres service using the Dockerfile in `services/postgres/` (which uses the `postgis/postgis` image).

### "Connection refused"
**Issue**: PostgreSQL isn't running or port is wrong

**Fix**: 
- Check PostgreSQL service is deployed and running
- Verify port is 5432 (default PostgreSQL port)
- Check Railway logs for PostgreSQL service

### Tables aren't created
**Issue**: Database bootstrap didn't run

**Fix**:
```bash
# For API service:
railway run python -c "from app.core.db import create_all_tables; create_all_tables()"
```

## Cost Estimate

- PostgreSQL Service: ~$5-10/month (depends on usage)
- API Service: ~$5/month
- **Total: ~$10-15/month**

Both services share the Railway free tier ($5 credit/month).

## Next Steps

After successful deployment:

1. ✅ Test API endpoints
2. ✅ Run seed data: `railway run python scripts/seed.py`
3. ✅ Update mobile app with Railway API URL
4. ✅ Set up monitoring in Railway dashboard
5. ✅ Configure custom domain (optional)
