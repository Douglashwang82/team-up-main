# Deploy to Railway from CLI

## ✅ Issue Fixed: Correct PostgreSQL Service Name

Your PostgreSQL service is named **`Postgres-dbDS`** (not `Postgres`).

The DATABASE_URL reference has been updated to:
```bash
DATABASE_URL=${{ Postgres-dbDS.DATABASE_URL }}
```

---

## 🚀 Quick Deploy Commands

### Deploy from CLI
```bash
cd services/api

# Deploy (upload and build)
railway up --detach

# Check deployment status
railway service status

# View logs (follow mode)
railway logs --follow

# View logs for specific deployment
railway logs <deployment-id>
```

### Check Variables
```bash
# List all variables
railway variable list

# Set a variable
railway variable set KEY=value

# Delete a variable
railway variable delete KEY
```

### Manage Services
```bash
# Check status
railway status

# Restart service
railway service restart

# Redeploy latest deployment
railway service redeploy
```

---

## 📋 Complete Deployment Workflow

### 1. **Verify Variables**
```bash
railway variable list
```

**Required variables:**
- ✅ `DATABASE_URL=${{ Postgres-dbDS.DATABASE_URL }}`
- ✅ `JWT_SECRET=<your-secret>`
- ✅ `PORT=8080` (auto-set by Railway)

### 2. **Deploy**
```bash
# From services/api directory
railway up --detach
```

This will:
- Upload your code to Railway
- Build the Docker image
- Deploy to Railway's infrastructure
- Start the service

### 3. **Monitor Deployment**
```bash
# Check build/deployment status
railway service status

# View real-time logs
railway logs --follow
```

### 4. **Verify Deployment**
```bash
# Get your API URL
railway domain

# Test the API
curl https://<your-domain>.up.railway.app/health
```

---

## 🔧 Troubleshooting

### Database Connection Issues

**Error:** `connection to server at "postgres.railway.internal" failed`

**Solution:** Verify DATABASE_URL references the correct service name:
```bash
# Check your PostgreSQL service name
railway status --json | grep -A 2 '"name"'

# Update DATABASE_URL with correct service name
railway variable set DATABASE_URL='${{ Postgres-dbDS.DATABASE_URL }}'
```

### Build Failures

**Check build logs:**
```bash
railway logs --build
```

Common issues:
- Missing dependencies in `requirements.txt`
- Dockerfile errors
- Build timeout (increase timeout in `railway.json`)

### Deployment Stuck

**Force redeploy:**
```bash
railway service redeploy
```

### Enable PostGIS Extension

**Method 1: Railway Dashboard**
1. Go to https://railway.app
2. Click **Postgres-dbDS** service
3. Click **Data** tab → **Query**
4. Run:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS btree_gist;
   ```

**Method 2: Using railway run** (if PostgreSQL client is installed locally)
```bash
railway run psql -c "CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS btree_gist;"
```

---

## 📊 Deployment Status Meanings

- **BUILDING**: Docker image is being built
- **DEPLOYING**: Image is being deployed to Railway infrastructure
- **ACTIVE**: Service is running and healthy
- **RUNNING**: Service is running (healthcheck pending)
- **FAILED**: Deployment failed (check logs)
- **CRASHED**: Service crashed after starting

---

## 🎯 Post-Deployment Checklist

After successful deployment:

- [ ] Verify `/health` endpoint returns 200
- [ ] Check database connection works
- [ ] Enable PostGIS extensions (see above)
- [ ] Test API endpoints
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)
- [ ] Enable auto-deployments from GitHub (optional)

---

## 💡 Tips

### Auto-Deploy from GitHub

1. Link GitHub repo in Railway dashboard
2. Select branch to deploy
3. Railway will auto-deploy on every push

### Environment Variables

**Best practices:**
- Use reference variables for service connections: `${{ ServiceName.VARIABLE }}`
- Never commit secrets to git
- Use Railway's variable management for all secrets

### Monitoring

View deployment metrics in Railway dashboard:
- CPU usage
- Memory usage
- Network traffic
- Request logs

---

## 🔗 Useful Links

- [Railway Dashboard](https://railway.app)
- [Railway Docs](https://docs.railway.com)
- [PostgreSQL on Railway](https://docs.railway.com/guides/postgresql)
- [Variables Reference](https://docs.railway.com/reference/variables)
- Build Logs: Check Railway dashboard → Service → Deployments

---

## 🆘 Quick Reference

```bash
# Deploy
railway up --detach

# Status
railway service status

# Logs
railway logs

# Restart
railway service restart

# Variables
railway variable list
railway variable set KEY=value

# Get API URL
railway domain
```

---

**Your API:** https://api-production-461d.up.railway.app
**PostgreSQL Service:** Postgres-dbDS
**Environment:** production
