from app.core import google_routes
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import requests
import hashlib
import os
import random
import string
from fastapi.middleware.cors import CORSMiddleware
from app.core.CreateUser_router import router as user_router
from app.core.LoginUser_router import router as login_router
from pydantic import BaseModel

load_dotenv()
app = FastAPI()
app.include_router(user_router)
app.include_router(login_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(ai.router, prefix="/ai")
app.include_router(workflow.router, prefix="/workflow")

class MedicalFormRequest(BaseModel):
    location: str
    language: str
    medical_issue: str

@app.post("/medicalpost")
async def medical_post(form: MedicalFormRequest):
    try:
        print("✅ /medicalpost endpoint was hit!")
        print("Received form data:", form)

        # ✨ Hardcoded response instead of OpenAI
        hardcoded_response = {
            "condition": "Common Cold",
            "recommended_specialty": "General Practitioner",
            "remedies": [
                "Drink plenty of fluids",
                "Rest",
                "Use over-the-counter cold medicines if needed"
            ],
            "emergency_advice": "If symptoms include difficulty breathing, visit an Emergency Room immediately.",
            "language": form.language
        }

        return {"message": hardcoded_response}  # Return wrapped in 'message' to match frontend

    except Exception as e:
        print(f"Exception caught: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
app.include_router(google_routes.router)
# app.include_router()
