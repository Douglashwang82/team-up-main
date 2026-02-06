#!/usr/bin/env python3
"""
Quick test to verify the app can start without database connection.
Run this to ensure Railway deployment will succeed.
"""
import os
import sys

# Set minimal env vars for testing
os.environ['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test'
os.environ['JWT_SECRET'] = 'test-secret'
os.environ['BOOTSTRAP_DB'] = '0'  # Skip DB bootstrap for this test

try:
    from app import create_app
    app = create_app()

    # Test health endpoint
    with app.test_client() as client:
        response = client.get('/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'ok'
        print("✅ Health check works!")
        print(f"   Response: {data}")

    print("\n✅ App startup test PASSED")
    print("   Your app should deploy successfully to Railway")
    sys.exit(0)

except Exception as e:
    print(f"\n❌ App startup test FAILED: {e}")
    import traceback
    traceback.print_exc()
    print("\n   Fix this error before deploying to Railway")
    sys.exit(1)
