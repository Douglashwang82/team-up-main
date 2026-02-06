import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    print("Starting database initialization...")
    from app.core.db import create_all_tables, ensure_postgis_extension
    
    print("Enabling PostGIS...")
    try:
        ensure_postgis_extension()
        print("PostGIS enabled.")
    except Exception as e:
        print(f"Warning enabling PostGIS: {e}")

    print("Creating tables...")
    create_all_tables()
    print("SUCCESS: Database initialized.")

except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    import traceback
    traceback.print_exc()
