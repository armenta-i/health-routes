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
from app.core.CreateUser_router import router as user_router
from app.core.LoginUser_router import router as login_router

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


class MedicalFormRequest(BaseModel):
    location: str
    language: str
    medical_issue: str

@app.post("/medicalpost")
async def medical_post(form: MedicalFormRequest):
    print("=== MEDICAL POST API CALLED ===")
    print(f"Received form data:")
    print(f"   - Location: '{form.location}'")
    print(f"   - Language: '{form.language}'")
    print(f"   - Medical Issue: '{form.medical_issue}'")
    
    try:
        # Validate input data
        if not form.location or not form.location.strip():
            print("ERROR: Location is empty")
            raise HTTPException(status_code=400, detail="Location is required")
        
        if not form.medical_issue or not form.medical_issue.strip():
            print("ERROR: Medical issue is empty")
            raise HTTPException(status_code=400, detail="Medical issue is required")
            
        if not form.language or not form.language.strip():
            print("ERROR: Language is empty")
            raise HTTPException(status_code=400, detail="Language is required")

        print("SUCCESS: Input validation passed")

        # Import and use Gemini API
        try:
            print("INFO: Importing Gemini service...")
            from app.services.gemini import get_medical_advice
            print("SUCCESS: Gemini service imported successfully")
        except ImportError as ie:
            print(f"IMPORT ERROR: Failed to import Gemini service: {ie}")
            raise HTTPException(status_code=500, detail=f"Gemini service not available: {str(ie)}")
        
        # Call Gemini API with form data
        print("INFO: Calling Gemini API...")
        print(f"   - Address: {form.location}")
        print(f"   - Health problems: {form.medical_issue}")
        print(f"   - Language: {form.language}")
        
        try:
            gemini_response = get_medical_advice(
                address=form.location,
                health_problems=form.medical_issue,
                language=form.language
            )
            print("SUCCESS: Gemini API call completed")
            print(f"Response type: {type(gemini_response)}")
            print(f"Response length: {len(gemini_response) if gemini_response else 0} characters")
            
            if not gemini_response:
                print("WARNING: Gemini returned empty response")
                raise Exception("Gemini API returned empty response")
                
            print(f"First 200 chars: {gemini_response[:200]}...")
            
        except Exception as gemini_error:
            print(f"GEMINI API ERROR: {str(gemini_error)}")
            print(f"Error type: {type(gemini_error)}")
            import traceback
            print("Full traceback:")
            traceback.print_exc()
            raise Exception(f"Gemini API failed: {str(gemini_error)}")

        # Prepare response
        response_data = {"message": gemini_response}
        print("SUCCESS: Response prepared successfully")
        print(f"Final response structure: {list(response_data.keys())}")
        
        return response_data

    except HTTPException as http_ex:
        print(f"HTTP EXCEPTION: {http_ex.detail}")
        raise http_ex
        
    except Exception as e:
        print(f"GENERAL EXCEPTION: {str(e)}")
        print(f"Exception type: {type(e)}")
        import traceback
        print("Full exception traceback:")
        traceback.print_exc()
        
        # Fallback response if Gemini fails
        fallback_response = f"""
        I apologize, but I'm temporarily unable to provide personalized medical advice due to a technical issue.
        
        Error details: {str(e)}
        
        Based on your symptoms: {form.medical_issue}
        
        Please consult with a healthcare professional for proper evaluation and treatment.
        
        If you're experiencing severe symptoms like chest pain, difficulty breathing, 
        or loss of consciousness, please seek emergency medical attention immediately by 
        calling 911 or visiting your nearest Emergency Room.
        """
        
        print("INFO: Returning fallback response")
        return {"message": fallback_response}
app.include_router(google_routes.router)
