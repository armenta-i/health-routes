# backend/tests/test_supabase_full_connection.py

import os
from app.services import supabase_service

def health_check_supabase():
    print("🔵 Starting Supabase Health Check...")

    # Step 1: Check ENV Variables
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise EnvironmentError("❌ SUPABASE_URL or SUPABASE_KEY environment variables are missing!")

    print("✅ Environment variables loaded.")

    # Step 2: Try simple query to test connection
    try:
        print("🔵 Checking connection by listing rows in 'test_table'...")
        response = supabase_service.fetch_from_test_table()

        if response.data is None:
            raise ConnectionError("❌ Supabase connection failed or 'test_table' does not exist.")
        else:
            print(f"✅ Connection Successful. Found {len(response.data)} records in 'test_table'.")
    except Exception as e:
        raise RuntimeError(f"❌ Supabase fetch failed: {e}")

    # Step 3: Try inserting a test record
    try:
        print("🔵 Trying to insert a test record into 'test_table'...")
        insert_response = supabase_service.insert_into_test_table(9282, "Andre Melendez")
        if insert_response.data is None:
            raise RuntimeError("❌ Insert failed, no data returned.")

        print(f"✅ Insert Successful: {insert_response.data}")
    except Exception as e:
        raise RuntimeError(f"❌ Insert test failed: {e}")

    print("🎯 Supabase is fully connected and operational!")

if __name__ == "__main__":
    health_check_supabase()