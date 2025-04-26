# backend/tests/test_supabase.py
import os
import pytest
from dotenv import load_dotenv
from app.services.supabase_service import supabase

@pytest.fixture(autouse=True)
def load_env():
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))
    assert os.getenv("SUPABASE_URL"), "SUPABASE_URL is missing"
    assert os.getenv("SUPABASE_SERVICE_ROLE_KEY"), "SUPABASE_SERVICE_ROLE_KEY is missing"

def test_supabase_select_items():
    """
    Runs a simple SELECT * FROM items LIMIT 1;
    Asserts we get HTTP 200 and a list back.
    """
    resp = supabase.table("items").select("*").limit(1).execute()
    assert resp.status_code == 200, f"Got {resp.status_code} / {resp.error}"
    assert isinstance(resp.data, list)