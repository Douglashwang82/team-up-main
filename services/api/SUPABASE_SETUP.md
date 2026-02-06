# Deploy with Supabase PostgreSQL (PostGIS Included)

## Why Supabase?

- ✅ **Free tier** with generous limits
- ✅ **PostGIS pre-installed** - no configuration needed
- ✅ **PostgreSQL 15+** with all extensions
- ✅ **No deployment complexity** - just get a connection string
- ✅ **Web dashboard** for database management
- ✅ **Automatic backups**

## Setup Steps (5 minutes)

### 1. Create Supabase Account

1. Go to https://supabase.com
2. Sign up (free)
3. Click **"New Project"**

### 2. Create Project

- **Name**: team-up-db (or whatever you want)
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to your users
- **Pricing Plan**: Free

Wait ~2 minutes for database to provision.

### 3. Get Connection String

1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string**
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
5. Replace `[PASSWORD]` with your actual password

### 4. Verify PostGIS is Available

In Supabase dashboard:
1. Go to **SQL Editor**
2. Run this query:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   SELECT PostGIS_version();
   ```

You should see the PostGIS version! 🎉

### 5. Update Railway API Service

Now update your Railway API service to use Supabase:

```bash
cd /Users/hwangdouglas/Projects/team-up-main/services/api

# Set the Supabase connection string
railway variables set DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Redeploy
railway up
```

### 6. Done! ✅

Your API will now connect to Supabase PostgreSQL with PostGIS enabled.

## Connection String Format

```
postgresql://postgres.PROJECT_REF:PASSWORD@HOST:PORT/postgres
```

**Example**:
```
postgresql://postgres.abcdefghijk:MySecureP@ss123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Advantages Over Self-Hosted

| Feature | Self-Hosted on Railway | Supabase |
|---------|------------------------|----------|
| PostGIS | ❌ Complex setup | ✅ Pre-installed |
| Cost | $5-10/month | ✅ Free tier |
| Backups | Manual | ✅ Automatic |
| Management | Docker/Railway | ✅ Web Dashboard |
| Setup Time | 30+ mins | ✅ 5 mins |

## Free Tier Limits

Supabase free tier includes:
- 500 MB database space
- Unlimited API requests
- 50,000 monthly active users
- 2 GB file storage
- 1 GB bandwidth

More than enough for development and small production apps!

## Security

- Connection is SSL encrypted by default
- Database password protected
- Can whitelist IP addresses if needed
- Row Level Security (RLS) available

## Next Steps After Setup

1. Your API will automatically create tables on first run (BOOTSTRAP_DB=1)
2. Run seed data: `railway run python scripts/seed.py`
3. Test your API endpoints
4. Update mobile app with Railway API URL

## Troubleshooting

### "Connection timeout"
- Check the connection string is correct
- Make sure you replaced [PASSWORD] with actual password
- Verify no extra characters or spaces

### "PostGIS not found"
- Run the CREATE EXTENSION commands in SQL Editor
- Some Supabase projects have it enabled by default

### "Database not found"
- The database name should be `postgres` (not `team_up`)
- Or create a new database in Supabase SQL Editor:
  ```sql
  CREATE DATABASE team_up;
  ```

## Cost Comparison

**Option A: Railway PostgreSQL (self-hosted)**
- PostgreSQL service: ~$5-10/month
- Total: $10-15/month

**Option B: Supabase**
- Free tier: $0/month
- If you exceed limits: $25/month (but unlikely for small apps)

## Migration from Local

If you have local data, you can export and import:

```bash
# Export from local
docker compose up -d db
docker compose exec db pg_dump -U postgres team_up > backup.sql

# Import to Supabase (using their connection string)
psql "postgresql://postgres.[REF]:[PASS]@...supabase.com:6543/postgres" < backup.sql
```
