# Alembic Reset Guide

This guide will help you completely reset your Alembic migrations and start fresh.

## Prerequisites

1. Make sure your database is running
2. Have database connection credentials ready
3. Backup any important data (this will drop all tables!)

## Step-by-Step Reset Process

### Step 1: Remove Old Migration Files

```bash
cd /Users/hwangdouglas/Projects/team-up-main/services/api

# Remove all migration files (keep the directory and __pycache__)
rm alembic/versions/*.py

# Or remove specific old migrations if you want to keep some
# rm alembic/versions/0a9b0aa6510e_*.py
# rm alembic/versions/20250117_*.py
# etc.
```

### Step 2: Drop the Alembic Version Table (if database is accessible)

If your database is running, connect and drop the alembic_version table:

```bash
# Option A: Using psql
psql -h localhost -U your_username -d your_database -c "DROP TABLE IF EXISTS alembic_version CASCADE;"

# Option B: Using Python
python3 -c "
from app.core.db import engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
    conn.commit()
"
```

### Step 3: Drop All Tables (Complete Reset)

```bash
# Option A: Drop entire database and recreate
psql -h localhost -U your_username -c "DROP DATABASE IF EXISTS your_database;"
psql -h localhost -U your_username -c "CREATE DATABASE your_database;"

# Option B: Drop all tables individually using Python
python3 -c "
from app.core.db import Base, engine
Base.metadata.drop_all(bind=engine)
"
```

### Step 4: Create Initial Migration

Now create a fresh initial migration with all your current models:

```bash
cd /Users/hwangdouglas/Projects/team-up-main/services/api

# Create new initial migration
python3 -m alembic revision --autogenerate -m "initial_migration"
```

This will create a new migration file in `alembic/versions/` with all your current models.

### Step 5: Review the Generated Migration

Open the newly created migration file and verify it includes all your tables:
- users
- venues
- courts
- timeslots
- bookings
- teamups
- teamup_participants
- teamup_join_requests

### Step 6: Apply the Migration

```bash
# Apply the migration to create all tables
python3 -m alembic upgrade head

# Verify it worked
python3 -m alembic current
```

## Quick Reset Script

Here's a bash script that does all steps (customize the database connection):

```bash
#!/bin/bash
# save as reset_alembic.sh

cd /Users/hwangdouglas/Projects/team-up-main/services/api

echo "Step 1: Removing old migration files..."
rm alembic/versions/*.py

echo "Step 2: Dropping all tables..."
python3 -c "
from app.core.db import Base, engine
from sqlalchemy import text
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
    conn.commit()
Base.metadata.drop_all(bind=engine)
print('All tables dropped!')
"

echo "Step 3: Creating new initial migration..."
python3 -m alembic revision --autogenerate -m "initial_migration"

echo "Step 4: Applying migration..."
python3 -m alembic upgrade head

echo "Step 5: Checking current version..."
python3 -m alembic current

echo "Done! Alembic has been reset."
```

## Common Issues

### Database Connection Error

If you get `nodename nor servname provided, or not known`:
- Check your database is running
- Verify your `.env` file has correct `DATABASE_URL`
- Make sure PostgreSQL service is started

### Permission Denied

If you get permission errors:
```bash
chmod +x reset_alembic.sh
```

### Migration Not Detecting Changes

If autogenerate doesn't detect your models:
- Check that models are imported in `alembic/env.py`
- Verify all models inherit from `Base`
- Make sure `target_metadata` is set correctly

## Verification

After reset, verify everything works:

```bash
# Check current migration version
python3 -m alembic current

# Check migration history
python3 -m alembic history

# Test database connection
python3 -c "from app.core.db import engine; print(engine.connect())"
```

## Next Steps After Reset

1. Run your application to verify all models work
2. Run seed script if you have one
3. Test API endpoints
4. Consider adding data migration scripts if needed

## Safety Tips

- Always backup your database before resetting
- Test on development environment first
- Keep a copy of old migration files if you need to reference them
- Document any manual schema changes you made outside of Alembic
