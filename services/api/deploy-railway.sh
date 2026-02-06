#!/bin/bash

echo "🚂 TeamUp API - Railway Deployment Script"
echo "=========================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login check
echo "📝 Checking Railway login status..."
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway:"
    railway login
fi

# Initialize if needed
if [ ! -f "railway.json" ]; then
    echo "⚠️  railway.json not found. Creating..."
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo "  1. Make sure you have a PostgreSQL database added"
echo "  2. PostGIS extension should be enabled"
echo "  3. Environment variables should be set"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

# Deploy
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📍 Your API URL:"
    railway domain
    echo ""
    echo "📊 View logs:"
    echo "  railway logs"
    echo ""
    echo "🔧 Manage environment:"
    echo "  railway variables"
    echo ""
    echo "🌐 Open dashboard:"
    echo "  railway open"
else
    echo "❌ Deployment failed. Check the logs above."
    exit 1
fi
