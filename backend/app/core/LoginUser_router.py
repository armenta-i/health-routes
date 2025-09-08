from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from app.services import supabase_service

router = APIRouter()

class UserLoginRequest(BaseModel):
    phone_number: str
    password: str

@router.post("/login")
async def login_user(user: UserLoginRequest):
    try:
        response = supabase_service.supabase.table("userst").select("*").eq("phonen", user.phone_number).execute()
        print(f"Response data: {response.data}")
    # Debug print the full response
        print(f"Response structure: {type(response)}")
        print(f"Response data: {response}")

        # Check if user exists
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid phone number or password")
        
        # Get the first matching user
        stored_user = response.data[0]
        
        # Verify password (assuming you added password column)
        # NOTE: In a production environment, you should use password hashing!
        if stored_user.get("password") != user.password:
            raise HTTPException(status_code=401, detail="Invalid phone number or password")
        
        # Return user data on successful login
        return {
            "message": "Login successful",
            "user_id": stored_user.get("user_id"),
            "full_name": f"{stored_user.get('fist_name', '')} {stored_user.get('last_name', '')}".strip(),
            # You can include other user fields that might be needed by the frontend
            "phone_number": stored_user.get("phonen")
        }

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        print(f"Exception caught: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")