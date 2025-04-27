from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import getpass
from langchain_openai import OpenAI

router = APIRouter()

# Load environment vars
load_dotenv()
if "OPENAI_API_KEY" not in os.environ:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter your OpenAI API key: ")

# Initialize OpenAI once
llm = OpenAI()

# Pydantic model for the incoming request
class MedicalForm(BaseModel):
    location: str
    language: str
    medicalIssue: str

# This will be your route
@router.post("/medicalpost")
async def medical_post(form: MedicalForm):
    console.log('Data Received')
    try:
        # Call your LLM with the form inputs
        prompt = f"""
        You are a healthcare assistant that helps users find nearby healthcare providers based on their symptoms and language needs.
        Given:
        - User's full Location: {form.location}
        - Symptoms or Issues: {form.medicalIssue}
        - Preferred Language: {form.language}
        You must:
        1. Analyze and determine a condition the user may be suffering from.
        2. Determine who should the user see (the doctor specialty)
        3. Remedies that the user can do.
        4. If symptoms are severe (e.g., chest pain, breathing problems), prioritize Emergency Rooms first.
        5. (Optional) Add a short sentence encouraging the user to seek help immediately if the symptoms are serious.

        Formatting:
        Respond in the language that matches the user's request (English or Spanish).
        Be helpful, reassuring, and professional.
        """

        response = llm.invoke(prompt)
        
        # Return the LLM response
        return {"message": response.content}

    except Exception as e:
        print(f"Exception caught: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))