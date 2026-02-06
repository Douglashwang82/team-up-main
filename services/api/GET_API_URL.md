# How to Access Your Railway API

## Method 1: Railway Dashboard (Easiest)

1. Go to https://railway.app
2. Login and select your project
3. Click on your **API service** (not the Postgres service)
4. Click on the "Settings" tab
5. Scroll down to "Networking"
6. Click "Generate Domain" if you don't have one yet
7. Your API URL will be something like: `https://your-service.up.railway.app`

## Method 2: Railway CLI

```bash
# Make sure you're in the API directory
cd services/api

# Link to your API service (if not already linked)
railway link

# Generate a domain for your service
railway domain

# The output will show your API URL
```

## Testing Your API

Once you have your API URL (e.g., `https://your-service.up.railway.app`):

### 1. Test Health Check

```bash
curl https://your-service.up.railway.app/health
```

Expected response:
```json
{"status":"ok"}
```

### 2. Test Login Endpoint

```bash
curl -X POST https://your-service.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

### 3. Test Events List

```bash
curl https://your-service.up.railway.app/events
```

## Update Your Mobile App

Once you have your API URL, update it in your mobile app:

**File:** `apps/mobile/lib/apiClient.ts`

```typescript
// Replace this line:
const BASE_URL = "http://localhost:8000";

// With your Railway URL:
const BASE_URL = "https://your-service.up.railway.app";
```

## Common Issues

### "Domain not found" or 404 Error

**Cause:** Service doesn't have a public domain yet

**Fix:**
1. Go to Railway dashboard → Your API service → Settings → Networking
2. Click "Generate Domain"
3. Wait a few seconds for DNS to propagate

### CORS Error in Mobile App

**Cause:** API is blocking requests from your mobile app domain

**Fix:** Update CORS settings in `services/api/app/__init__.py`:

```python
# Allow all origins (for development/testing):
CORS(app, resources={r"/*": {"origins": ["*"]}})

# Or specify your domains (for production):
CORS(app, resources={r"/*": {
    "origins": [
        "http://localhost:3000",
        "https://your-mobile-app.com",
        "exp://192.168.1.100:19000"  # Expo development
    ]
}})
```

### 503 Service Unavailable

**Cause:** Deployment failed or service is starting up

**Fix:**
1. Check Railway logs: `railway logs`
2. Or view in dashboard: Deployments → View Logs
3. Look for errors and fix them
4. Redeploy: `railway up`

## View Logs

```bash
# Real-time logs
railway logs

# Or follow along
railway logs --follow
```

## Environment Variables

To view or set environment variables:

```bash
# View all variables
railway variables

# Set a variable
railway variables set KEY="value"

# Example: Set JWT secret
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
```

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy | `railway up` |
| Get URL | `railway domain` |
| View logs | `railway logs` |
| View status | `railway status` |
| Open dashboard | `railway open` |
| Link service | `railway link` |

## Next Steps

1. ✅ Get your API URL from Railway dashboard or CLI
2. ✅ Test the `/health` endpoint
3. ✅ Update mobile app with the API URL
4. ✅ Test your mobile app with the deployed API
5. ✅ Run seed data if needed: `railway run python scripts/seed.py`
