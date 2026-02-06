# API Deployment Guide

## Option 1: Railway (Recommended) 🚂

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Steps

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd services/api
   railway init
   ```

4. **Add PostgreSQL Database**
   ```bash
   railway add --plugin postgresql
   ```

5. **Enable PostGIS Extension**
   - Go to Railway dashboard → Your database → Query tab
   - Run: `CREATE EXTENSION IF NOT EXISTS postgis;`

6. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET="your-secret-key-here"
   railway variables set BOOTSTRAP_DB="1"
   ```

7. **Deploy**
   ```bash
   railway up
   ```

8. **Get Your URL**
   ```bash
   railway domain
   ```

### Environment Variables Needed
- `DATABASE_URL` (auto-set by Railway)
- `JWT_SECRET` (generate with: `openssl rand -hex 32`)
- `JWT_ACCESS_TTL` (default: 3600)
- `JWT_REFRESH_TTL` (default: 2592000)
- `BOOTSTRAP_DB` (set to "1" for initial setup)

---

## Option 2: Render 🎨

### Steps

1. **Sign up** at https://render.com

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Name: `teamup-db`
   - Plan: Free or Starter
   - After creation, connect and enable PostGIS:
     ```sql
     CREATE EXTENSION IF NOT EXISTS postgis;
     ```

3. **Create Web Service**
   - New → Web Service
   - Connect your GitHub repo
   - Root Directory: `services/api`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`
   - Environment: Python 3

4. **Add Environment Variables**
   - Go to Environment tab
   - Add:
     ```
     DATABASE_URL=<copy from database>
     JWT_SECRET=<generate secret>
     BOOTSTRAP_DB=1
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment

---

## Option 3: Fly.io 🪰

### Steps

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Create Dockerfile** (if not exists)
   ```bash
   cd services/api
   fly launch
   ```

4. **Create PostgreSQL**
   ```bash
   fly postgres create --name teamup-postgres
   fly postgres attach teamup-postgres
   ```

5. **Enable PostGIS**
   ```bash
   fly postgres connect -a teamup-postgres
   # In psql:
   CREATE EXTENSION IF NOT EXISTS postgis;
   \q
   ```

6. **Set Secrets**
   ```bash
   fly secrets set JWT_SECRET="your-secret"
   fly secrets set BOOTSTRAP_DB="1"
   ```

7. **Deploy**
   ```bash
   fly deploy
   ```

---

## Option 4: AWS (Production-Ready) ☁️

AWS offers multiple deployment options. Choose based on your needs:

### Option 4A: AWS Elastic Beanstalk (Recommended for AWS)

Easiest AWS option - managed platform for Flask apps.

**Prerequisites:**
- AWS account
- AWS CLI installed

**Steps:**

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk**
   ```bash
   cd services/api
   eb init -p python-3.11 teamup-api --region ap-southeast-1
   ```

3. **Create RDS PostgreSQL Database**
   ```bash
   eb create teamup-env --database.engine postgres --database.version 15
   ```

4. **Enable PostGIS Extension**
   - Connect to RDS instance using pgAdmin or psql
   - Run: `CREATE EXTENSION IF NOT EXISTS postgis;`

5. **Set Environment Variables**
   Create `.ebextensions/env.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:application:environment:
       JWT_SECRET: "your-secret-here"
       BOOTSTRAP_DB: "1"
   ```

6. **Deploy**
   ```bash
   eb deploy
   ```

7. **Open Application**
   ```bash
   eb open
   ```

**Cost:** ~$50-70/month (t3.micro EC2 + db.t3.micro RDS)

---

### Option 4B: AWS App Runner (Docker-Based)

Simpler than ECS, fully managed container service.

**Steps:**

1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name teamup-api --region ap-southeast-1
   ```

2. **Build and Push Docker Image**
   ```bash
   cd services/api
   aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com
   docker build -t teamup-api .
   docker tag teamup-api:latest YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/teamup-api:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/teamup-api:latest
   ```

3. **Create RDS PostgreSQL Instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier teamup-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --engine-version 15.4 \
     --master-username postgres \
     --master-user-password YourPassword123 \
     --allocated-storage 20
   ```

4. **Enable PostGIS**
   ```bash
   psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -d postgres
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

5. **Create App Runner Service**
   - Go to AWS App Runner console
   - Create service from ECR
   - Select your image
   - Add environment variables:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `BOOTSTRAP_DB=1`
   - Configure port: 8080

**Cost:** ~$30-50/month (App Runner + RDS)

---

### Option 4C: AWS ECS with Fargate (Scalable)

Best for production apps needing auto-scaling.

**Steps:**

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name teamup-cluster --region ap-southeast-1
   ```

2. **Build and Push to ECR** (same as App Runner steps 1-2)

3. **Create Task Definition**
   Create `task-definition.json`:
   ```json
   {
     "family": "teamup-api",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "teamup-api",
         "image": "YOUR_ACCOUNT_ID.dkr.ecr.ap-southeast-1.amazonaws.com/teamup-api:latest",
         "portMappings": [{"containerPort": 8080, "protocol": "tcp"}],
         "environment": [
           {"name": "DATABASE_URL", "value": "postgresql://..."},
           {"name": "JWT_SECRET", "value": "your-secret"},
           {"name": "BOOTSTRAP_DB", "value": "1"}
         ]
       }
     ]
   }
   ```

4. **Register Task Definition**
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

5. **Create ALB and Target Group**
   - Use AWS Console or CLI to create Application Load Balancer
   - Create target group pointing to port 8080

6. **Create ECS Service**
   ```bash
   aws ecs create-service \
     --cluster teamup-cluster \
     --service-name teamup-service \
     --task-definition teamup-api \
     --desired-count 1 \
     --launch-type FARGATE \
     --load-balancers "targetGroupArn=YOUR_TG_ARN,containerName=teamup-api,containerPort=8080"
   ```

**Cost:** ~$40-60/month (Fargate + ALB + RDS)

---

### Option 4D: AWS Lambda + API Gateway (Serverless)

Cheapest for low-traffic apps, scales automatically.

**Steps:**

1. **Install Serverless Framework**
   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml**
   ```yaml
   service: teamup-api
   provider:
     name: aws
     runtime: python3.11
     region: ap-southeast-1
     environment:
       DATABASE_URL: ${env:DATABASE_URL}
       JWT_SECRET: ${env:JWT_SECRET}
   functions:
     api:
       handler: wsgi_handler.handler
       events:
         - http: ANY /
         - http: ANY /{proxy+}
   ```

3. **Create Lambda Handler**
   Create `wsgi_handler.py`:
   ```python
   from werkzeug.wrappers import Request
   from app import app

   def handler(event, context):
       # AWS Lambda WSGI adapter
       # Use package like 'serverless-wsgi' or 'aws-wsgi'
       pass
   ```

4. **Deploy**
   ```bash
   serverless deploy
   ```

**Cost:** ~$5-15/month (mostly RDS, Lambda is nearly free for low traffic)

---

## Option 5: Google Cloud Run ☁️

### Steps

1. **Install gcloud CLI**
   ```bash
   # Follow: https://cloud.google.com/sdk/docs/install
   ```

2. **Create Cloud SQL Instance**
   ```bash
   gcloud sql instances create teamup-db \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=asia-east1
   ```

3. **Enable PostGIS**
   ```bash
   gcloud sql connect teamup-db --user=postgres
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

4. **Create Dockerfile**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD exec gunicorn --bind :$PORT wsgi:app
   ```

5. **Build and Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/teamup-api
   gcloud run deploy teamup-api \
     --image gcr.io/YOUR_PROJECT_ID/teamup-api \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated
   ```

---

## Post-Deployment Checklist

- [ ] API health check works: `GET /health`
- [ ] Database connection successful
- [ ] PostGIS extension enabled
- [ ] Environment variables set
- [ ] Seed data loaded (optional): `python scripts/seed.py`
- [ ] CORS configured for your mobile app domain
- [ ] Update mobile app API URL

---

## Updating Mobile App

After deployment, update your mobile app's API URL:

**`apps/mobile/lib/apiClient.ts`**
```typescript
const BASE_URL = "https://your-api-url.railway.app"; // or other domain
```

---

## Cost Comparison

| Platform | Free Tier | Starter Cost | Database | Setup Time |
|----------|-----------|--------------|----------|------------|
| **Railway** | $5 credit/month | ~$10/month | Included (PostgreSQL) | 5 min |
| **Render** | Limited (sleeps) | $7/month | $7/month (PostgreSQL) | 10 min |
| **Fly.io** | 3 VMs free | ~$5/month | $0-15/month | 10 min |
| **Cloud Run** | Pay-per-use | ~$5-10/month | $10-25/month (Cloud SQL) | 15 min |
| **AWS Elastic Beanstalk** | 12 months free | ~$50-70/month | $25-40/month (RDS) | 30 min |
| **AWS App Runner** | No free tier | ~$30-50/month | $25-40/month (RDS) | 20 min |
| **AWS ECS Fargate** | No free tier | ~$40-60/month | $25-40/month (RDS) | 45 min |
| **AWS Lambda** | 1M requests free | ~$5-15/month | $25-40/month (RDS) | 25 min |

---

## Platform Selection Guide

### Choose Railway if:
- ✅ You want the easiest/fastest setup (5 minutes)
- ✅ Building MVP or small project
- ✅ Budget-conscious ($10/month)
- ✅ Want automatic deployments from GitHub
- ✅ Don't want to manage infrastructure

### Choose AWS if:
- ✅ Building production/enterprise app
- ✅ Need compliance (HIPAA, SOC2, etc.)
- ✅ Require VPC networking/advanced security
- ✅ Planning to scale significantly
- ✅ Already using AWS for other services

**Which AWS option?**
- **Elastic Beanstalk**: Easiest AWS option, managed Flask platform
- **App Runner**: Simple container deployment, good middle ground
- **ECS Fargate**: Need auto-scaling and load balancing
- **Lambda**: Low traffic, want serverless, minimize costs

### Choose Render if:
- ✅ Want free tier (with sleep on inactivity)
- ✅ Simple deployment like Railway but want alternatives
- ✅ Good for side projects

### Choose Fly.io if:
- ✅ Want global edge deployment
- ✅ Need multi-region support
- ✅ Have some DevOps experience

### Choose Google Cloud Run if:
- ✅ Already using Google Cloud
- ✅ Want containerized deployment
- ✅ Pay-per-use billing preferred

---

## Recommended for Most Users: Railway

**Why Railway?**
1. ✅ Easiest setup (5 minutes)
2. ✅ All-in-one (app + database)
3. ✅ Automatic HTTPS
4. ✅ GitHub auto-deploy
5. ✅ PostGIS works out of box
6. ✅ Affordable ($10/month total)

**Quick Start:**
```bash
npm i -g @railway/cli
railway login
cd services/api
railway init
railway add --plugin postgresql
railway up
```

Done! 🎉

---

## AWS vs Simple Platforms - Why the Price Difference?

**Simple platforms (Railway, Render):**
- Optimized for small apps
- Shared resources
- Less configuration needed
- Good for 0-10K users

**AWS:**
- Dedicated resources (EC2, RDS)
- Production-grade infrastructure
- Fine-grained control
- Better for 10K+ users, compliance needs

**For this TeamUp app:** Start with Railway. Migrate to AWS when you need:
- 10K+ active users
- Compliance requirements
- Custom networking/VPC
- Multi-region deployment
