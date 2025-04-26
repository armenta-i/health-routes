from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import supabase_service

router = APIRouter()

# Pydantic model for incoming user data
class UserCreateRequest(BaseModel):
    phone_number: str
    password: str  # Prefer storing password as TEXT, even if temporarily
    full_name: str

# POST /users - Create a new user
@router.post("/users")
async def create_user(user: UserCreateRequest):
    try:
        user_data = {
            "PhoneN": user.phone_number,
            "PASSWORD": user.password,
            "FullName": user.full_name
        }
        response = supabase_service.supabase.table("USERST").insert(user_data).execute()

        if response.error:
            raise HTTPException(status_code=400, detail=response.error.message)

        return {"message": "User created successfully", "data": response.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))