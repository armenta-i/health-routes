from supabase import create_client, Client
from app.core.config import settings

# initialize Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ANON_KEY 
)

def insert_row(table: str, data: dict):
    """Insert a row into a Supabase table."""
    response = supabase.table(table).insert(data).execute()
    return response

def select_rows(table: str, columns: list[str] = ["*"], filters: dict | None = None):
    """Select rows; optional eq-filters."""
    query = supabase.table(table).select(",".join(columns))
    if filters:
        for col, val in filters.items():
            query = query.eq(col, val)
    return query.execute()