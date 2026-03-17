#!/bin/bash

# Railway CLI Deployment Script for TeamUp
# This script handles deploying both Backend and Frontend services.

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚂 Railway CLI Deployment Helper${NC}"
echo "=================================="

# 1. Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI not found. Please install it: npm install -g @railway/cli${NC}"
    exit 1
fi

# 2. Check Login
echo -e "${BLUE}📝 Checking Railway login status...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Railway first:${NC}"
    railway login
fi

# 3. Backend Deployment
echo -e "\n${BLUE}🚀 Provisioning Backend API...${NC}"
cd services/api
# We use the existing Dockerfile-based deployment in this folder
railway update --name "teamup-api" || echo "Service might already exist"
railway up
cd ../..

# 4. Frontend Deployment
echo -e "\n${BLUE}🚀 Provisioning Frontend Web...${NC}"
# For the frontend, we need to run from root to access packages/api-client
# We can use the monorepo-friendly setup by specifying the build context
# But Railway CLI links to a specific service.
# If you haven't linked apps/web to a service yet, do:
# cd apps/web && railway link

echo -e "${YELLOW}⚠️  Note: Ensure apps/web is linked to your Railway project's web service.${NC}"
cd apps/web
railway update --name "teamup-web" || echo "Service might already exist"
# We trigger the up command which will use Nixpacks by default
# Note: You might need to set the BUILD_COMMAND in Railway dashboard to:
# pnpm install && pnpm codegen && pnpm -C apps/web build
railway up
cd ../..

echo -e "\n${GREEN}✅ Deployment commands sent!${NC}"
echo -e "Check your Railway dashboard for build progress: ${BLUE}https://railway.app/dashboard${NC}"
