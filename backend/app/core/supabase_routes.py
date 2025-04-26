# backend/app/core/config.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

load_dotenv(dotenv_path="/app/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in environment!")