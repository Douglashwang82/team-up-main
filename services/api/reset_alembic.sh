#!/bin/bash
# Alembic Reset Script
# This script will completely reset your Alembic migrations

set -e  # Exit on error

cd "$(dirname "$0")"

echo "================================================"
echo "Alembic Reset Script"
echo "================================================"
echo ""
echo "WARNING: This will:"
echo "  1. Delete all migration files"
echo "  2. Drop all database tables"
echo "  3. Create a new initial migration"
echo "  4. Apply the migration to recreate tables"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Reset cancelled."
    exit 0
fi

echo ""
echo "Step 1: Removing old migration files..."
rm -f alembic/versions/*.py
echo "✓ Old migration files removed"

echo ""
echo "Step 2: Dropping all tables and alembic_version..."
python3 -c "
from app.core.db import Base, engine
from sqlalchemy import text

print('Dropping alembic_version table...')
try:
    with engine.connect() as conn:
        conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
        conn.commit()
    print('✓ Alembic version table dropped')
except Exception as e:
    print(f'Warning: Could not drop alembic_version: {e}')

print('Dropping all tables...')
try:
    Base.metadata.drop_all(bind=engine)
    print('✓ All tables dropped successfully')
except Exception as e:
    print(f'Error dropping tables: {e}')
    exit(1)
"

echo ""
echo "Step 3: Creating new initial migration..."
python3 -m alembic revision --autogenerate -m "initial_migration"
echo "✓ New migration created"

echo ""
echo "Step 4: Applying migration to database..."
python3 -m alembic upgrade head
echo "✓ Migration applied"

echo ""
echo "Step 5: Verifying migration status..."
python3 -m alembic current

echo ""
echo "================================================"
echo "✓ Alembic reset completed successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "  - Run your seed script if you have one"
echo "  - Test your API endpoints"
echo "  - Verify all tables were created correctly"
