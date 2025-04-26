from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from app.services import supabase_service

router = APIRouter()

# class MedicalFormRequest(BaseModel):
