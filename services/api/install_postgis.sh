#!/bin/bash
# Script to install PostGIS on Railway's PostgreSQL
# This needs to be run ONCE in the PostgreSQL container

echo "Installing PostGIS extension..."

# This script should be run with railway run in the PostgreSQL service context
# Railway's PostgreSQL should have the capability to install extensions

psql $DATABASE_URL -c "SELECT version();"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS btree_gist;"
psql $DATABASE_URL -c "SELECT PostGIS_version();"

echo "PostGIS installation complete!"
