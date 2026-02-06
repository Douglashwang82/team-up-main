#!/bin/bash
# Quick deployment script for PostgreSQL on Railway

set -e

echo "🚀 Deploying PostgreSQL with PostGIS to Railway..."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found!"
    echo "Install it with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

echo "📦 Deploying PostgreSQL service..."
railway up

echo ""
echo "🔑 Setting secure password..."
POSTGRES_PASSWORD=$(openssl rand -hex 32)
railway variables set POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

echo ""
echo "✅ PostgreSQL deployed successfully!"
echo ""
echo "📋 Connection Details:"
echo "   User: postgres"
echo "   Database: team_up"
echo "   Password: $POSTGRES_PASSWORD"
echo ""
echo "⚠️  IMPORTANT: Save this password! You'll need it for the API service."
echo ""
echo "🔗 Next Steps:"
echo "   1. Note the password above"
echo "   2. Go to Railway dashboard to get the service URL"
echo "   3. Deploy your API service (cd ../api)"
echo "   4. Set DATABASE_URL in API service to:"
echo "      postgresql://postgres:$POSTGRES_PASSWORD@<postgres-service-url>:5432/team_up"
echo ""
echo "📚 See DEPLOY.md for complete instructions"
