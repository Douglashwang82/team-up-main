# Railway Deployment Steps

## Prerequisites

1. Railway account at https://railway.app
2. Railway CLI installed: `npm install -g @railway/cli`

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Railway FIRST

```bash
railway login
cd services/api
railway init  # Create new project or link existing
railway add --plugin postgresql
```

### 2. Enable PostGIS Extension (CRITICAL)

Go to Railway dashboard:
1. Click on your PostgreSQL service
2. Go to "Data" tab or use "Connect"
3. Open Query tab
4. Run these SQL commands:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

### 3. Set Environment Variables

```bash
# Generate a secure JWT secret
railway variables set JWT_SECRET="$(openssl rand -hex 32)"

# Disable database bootstrap for first deploy (we'll do it manually)
railway variables set BOOTSTRAP_DB="0"
```

### 4. Deploy the API

```bash
railway up
```

### 5. After Successful Deployment

Once the healthcheck passes and deployment succeeds:

```bash
# Enable database bootstrap for future deployments
railway variables set BOOTSTRAP_DB="1"

# Run database setup manually (one-time)
railway run python -c "from app.core.db import create_all_tables; create_all_tables()"
```

### 6. Get Your API URL

```bash
railway domain
```

The output will be your API URL (e.g., `https://your-app.up.railway.app`)

### 7. Update Mobile App

Update your mobile app's API URL in `apps/mobile/lib/apiClient.ts`:

```typescript
const BASE_URL = "https://your-app.up.railway.app";
```

## Troubleshooting

### Error: "Service Unavailable" during healthcheck

**Cause**: Database bootstrap is taking too long or failing

**Fix**:
1. Set `BOOTSTRAP_DB=0` to disable bootstrap
2. Deploy without database initialization
3. After deploy succeeds, run bootstrap manually:
   ```bash
   railway run python scripts/seed.py
   ```

### Error: "ModuleNotFoundError: No module named 'psycopg2'"

**Cause**: Wrong PostgreSQL driver in requirements.txt

**Fix**: Already fixed - using `psycopg2-binary==2.9.9`

### Error: Database connection timeout

**Cause**: DATABASE_URL format or database not ready

**Fix**:
1. Verify DATABASE_URL is set automatically by Railway
2. Check database is running in Railway dashboard
3. Ensure PostGIS extensions are enabled

### Healthcheck keeps failing

**Possible causes and fixes**:

1. **App taking too long to start**
   - Check Railway logs for errors
   - Reduce workers to 1 temporarily
   - Increase `healthcheckTimeout` in railway.json

2. **Database connection issues**
   - Set `BOOTSTRAP_DB=0` temporarily
   - Check DATABASE_URL is correct
   - Verify PostgreSQL service is running

3. **Port binding issues**
   - Railway auto-sets $PORT environment variable
   - Our config uses `--bind 0.0.0.0:$PORT`
   - Check logs to verify correct port

### View Logs

```bash
# Real-time logs
railway logs

# Or view in Railway dashboard > Deployments > View Logs
```

## Common Configuration Issues

### CORS Errors

The API currently allows only `http://localhost:3000`. Update in `app/__init__.py`:

```python
CORS(app, resources={r"/*": {"origins": ["*"]}})  # Allow all origins
# Or specify your domains:
# CORS(app, resources={r"/*": {"origins": ["https://your-mobile-app.com"]}})
```

### Database Bootstrap Taking Too Long

If database initialization times out:

1. Disable auto-bootstrap:
   ```bash
   railway variables set BOOTSTRAP_DB="0"
   ```

2. Deploy without bootstrap

3. Run setup manually:
   ```bash
   railway run python -c "
from app.core.db import ensure_postgis_extension, create_all_tables
ensure_postgis_extension()
create_all_tables()
print('Database initialized!')
"
   ```

## Production Checklist

Before going to production:

- [ ] Generate and set secure `JWT_SECRET`
- [ ] Enable PostGIS extension in database
- [ ] Configure proper CORS origins
- [ ] Test all API endpoints
- [ ] Run seed data if needed: `railway run python scripts/seed.py`
- [ ] Set up monitoring/alerts in Railway dashboard
- [ ] Configure custom domain (optional)
- [ ] Enable auto-deployments from GitHub (optional)

## Cost

- PostgreSQL: ~$5/month
- API Service: ~$5/month
- **Total: ~$10/month**

First $5 is free with Railway credit!
