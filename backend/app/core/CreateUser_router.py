from fastapi import APIRouter, FastAPI, HTTPException
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
            "phonen": user.phone_number,
            "password": user.password,
            "fullname": user.full_name
        }
        print(f"Attempting to insert: {user_data}")  # Debug print
        
        # Execute the insert query
        response = supabase_service.supabase.table("userst").insert(user_data).execute()

        # Debug print the full response
        print(f"Response structure: {type(response)}")
        print(f"Response data: {response}")
        
        # Check if response contains data or error
        if hasattr(response, 'data'):
            return {"message": "User created successfully", "data": response.data}
        else:
            # Handle case where response format is different
            return {"message": "User created successfully", "response": str(response)}
    
    except Exception as e:
        print(f"Exception caught: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))