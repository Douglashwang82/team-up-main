#!/usr/bin/env python3
"""
Drop all tables and alembic_version to start fresh
"""
from app.core.db import Base, engine
from sqlalchemy import text

def drop_all():
    print("Dropping alembic_version table...")
    try:
        with engine.connect() as conn:
            conn.execute(text('DROP TABLE IF EXISTS alembic_version CASCADE;'))
            conn.commit()
        print("✓ Alembic version table dropped")
    except Exception as e:
        print(f"Warning: Could not drop alembic_version: {e}")

    print("\nDropping all tables...")
    try:
        Base.metadata.drop_all(bind=engine)
        print("✓ All tables dropped successfully")
    except Exception as e:
        print(f"Error dropping tables: {e}")
        return False

    print("\n✓ Database is clean and ready for migration")
    return True

if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("WARNING: This will drop ALL tables in the database")
    print("=" * 60)

    if len(sys.argv) > 1 and sys.argv[1] == "--yes":
        confirm = "yes"
    else:
        confirm = input("\nType 'yes' to continue: ")

    if confirm.lower() == "yes":
        if drop_all():
            print("\nNext step: Run 'python3 -m alembic upgrade head'")
            sys.exit(0)
        else:
            sys.exit(1)
    else:
        print("Cancelled.")
        sys.exit(0)
