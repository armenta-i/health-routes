
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL        = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY   = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY= os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Missing Supabase config in .env")

