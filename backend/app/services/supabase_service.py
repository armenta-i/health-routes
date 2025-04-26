# backend/app/services/supabase_service.py
from supabase import create_client
from app.core import config

supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def insert_into_test_table(id: int, name: str):
    response = supabase.table("test_table").insert({"id": id, "name": name}).execute()
    return response

def fetch_from_test_table():
    response = supabase.table("test_table").select("*").execute()
    return response