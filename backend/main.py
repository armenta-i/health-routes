from app.core import google_routes
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
import requests
import hashlib
import os
import random
import string
from typing import List, Dict, Any
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

@app.get("/directions")
async def get_directions(
    origin: str = Query(..., description="Origin coordinates as 'lat,lng'"),
    destination: str = Query(..., description="Destination coordinates as 'lat,lng'")
):
    """
    Get real-time directions between two points using Google Directions API.
    Returns optimized route coordinates for real-time navigation.
    """
    try:
        # Parse coordinates
        origin_coords = origin.split(',')
        dest_coords = destination.split(',')
        
        if len(origin_coords) != 2 or len(dest_coords) != 2:
            raise HTTPException(status_code=400, detail="Invalid coordinate format. Use 'lat,lng'")
        
        # Google Directions API request
        GOOGLE_API_KEY = os.getenv("GOOGLEMAPS_API_KEY")
        if not GOOGLE_API_KEY:
            # Fallback: return straight line
            return {
                "route": [
                    {"latitude": float(origin_coords[0]), "longitude": float(origin_coords[1])},
                    {"latitude": float(dest_coords[0]), "longitude": float(dest_coords[1])}
                ],
                "distance": "Unknown",
                "duration": "Unknown",
                "steps": []
            }
        
        # Call Google Directions API
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": origin,
            "destination": destination,
            "mode": "driving",
            "alternatives": "true",
            "traffic_model": "best_guess",
            "departure_time": "now",
            "key": GOOGLE_API_KEY
        }
        
        response = requests.get(url, params=params)
        data = response.json()
        
        if data["status"] != "OK":
            raise HTTPException(status_code=400, detail=f"Directions API error: {data['status']}")
        
        # Extract the best route
        route = data["routes"][0]
        legs = route["legs"][0]
        
        # Convert steps to coordinate array
        route_coordinates = []
        steps = []
        
        for step in legs["steps"]:
            # Add start point
            start_location = step["start_location"]
            route_coordinates.append({
                "latitude": start_location["lat"],
                "longitude": start_location["lng"]
            })
            
            # Decode polyline for smooth route
            if "polyline" in step and "points" in step["polyline"]:
                polyline_points = decode_polyline(step["polyline"]["points"])
                route_coordinates.extend(polyline_points)
            
            # Add turn-by-turn instruction
            steps.append({
                "instruction": step["html_instructions"].replace("<b>", "").replace("</b>", "").replace("<div>", " ").replace("</div>", ""),
                "distance": step["distance"]["text"],
                "duration": step["duration"]["text"],
                "location": {
                    "latitude": start_location["lat"],
                    "longitude": start_location["lng"]
                }
            })
        
        # Add final destination
        end_location = legs["end_location"]
        route_coordinates.append({
            "latitude": end_location["lat"],
            "longitude": end_location["lng"]
        })
        
        return {
            "route": route_coordinates,
            "distance": legs["distance"]["text"],
            "duration": legs["duration"]["text"],
            "steps": steps
        }
        
    except Exception as e:
        print(f"Directions API error: {str(e)}")
        # Fallback to straight line
        try:
            origin_coords = origin.split(',')
            dest_coords = destination.split(',')
            return {
                "route": [
                    {"latitude": float(origin_coords[0]), "longitude": float(origin_coords[1])},
                    {"latitude": float(dest_coords[0]), "longitude": float(dest_coords[1])}
                ],
                "distance": "Unknown",
                "duration": "Unknown",
                "steps": [{"instruction": "Navigate to destination", "distance": "Unknown", "duration": "Unknown"}]
            }
        except:
            raise HTTPException(status_code=500, detail="Unable to process directions request")

def decode_polyline(polyline_str):
    """Decode Google's polyline format to latitude/longitude coordinates."""
    index = 0
    lat = 0
    lng = 0
    coordinates = []
    
    while index < len(polyline_str):
        # Decode latitude
        shift = 0
        result = 0
        while True:
            byte = ord(polyline_str[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        
        dlat = ~(result >> 1) if result & 1 else result >> 1
        lat += dlat
        
        # Decode longitude
        shift = 0
        result = 0
        while True:
            byte = ord(polyline_str[index]) - 63
            index += 1
            result |= (byte & 0x1f) << shift
            shift += 5
            if byte < 0x20:
                break
        
        dlng = ~(result >> 1) if result & 1 else result >> 1
        lng += dlng
        
        coordinates.append({
            "latitude": lat / 1e5,
            "longitude": lng / 1e5
        })
    
    return coordinates

app.include_router(google_routes.router)
