#!/usr/bin/env python3
"""
Script to enable PostGIS extensions on Railway Postgres database.
Run with: railway run python setup_postgis.py
"""
import os
import sys
from sqlalchemy import create_engine, text

def get_database_url():
    """Get database URL from environment."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("ERROR: DATABASE_URL not found in environment")
        print("Make sure you're running this with: railway run python setup_postgis.py")
        sys.exit(1)
    
    # Convert postgres:// to postgresql:// if needed
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    return db_url

def setup_postgis():
    """Enable PostGIS extensions."""
    print("Setting up PostGIS extensions...")
    
    db_url = get_database_url()
    print(f"Connecting to database...")
    
    try:
        engine = create_engine(db_url, echo=True)
        
        with engine.connect() as conn:
            print("\n1. Creating PostGIS extension...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
            conn.commit()
            print("✓ PostGIS extension created")
            
            print("\n2. Creating btree_gist extension...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gist"))
            conn.commit()
            print("✓ btree_gist extension created")
            
        print("\n✅ All extensions enabled successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_postgis()
