from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import httpx
import os
import json
from datetime import datetime
from pathlib import Path

router = APIRouter()

# Load your API Key (better practice: use an environment variable)
GOOGLEMAPS_API_KEY = "AIzaSyC7r1yEmkgD4V30Di5ba9bUQaUaEiJyPjo"

# Create exports directory if it doesn't exist
EXPORTS_DIR = Path("exports")
EXPORTS_DIR.mkdir(exist_ok=True)


@router.get("/api/places/nearby")
async def get_nearby_places(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius: int = Query(10000),
    place_type: str = Query("Hospital"),
):
    try:
        if not GOOGLEMAPS_API_KEY:
            raise ValueError("GOOGLEMAPS_API_KEY environment variable not set.")
        
        print(f"Searching for {place_type} within {radius}m of {latitude},{longitude}")
        nearby_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        nearby_params = {
            "location": f"{latitude},{longitude}",
            "radius": radius,
            "key": GOOGLEMAPS_API_KEY,
        }
        if place_type:
            nearby_params["type"] = place_type

        full_place_details = []
        
        async with httpx.AsyncClient() as client:
            # ➡️ You missed this request:
            nearby_response = await client.get(nearby_url, params=nearby_params)
            nearby_data = nearby_response.json()

            places = nearby_data.get('results', [])
            print(f"Found {len(places)} nearby places. Fetching details...")

            for place in places:
                place_id = place.get('place_id')
                if not place_id:
                    continue

                details_url = "https://maps.googleapis.com/maps/api/place/details/json"
                details_params = {
                    "place_id": place_id,
                    "fields": "name,formatted_phone_number,international_phone_number,formatted_address,geometry",
                    "key": GOOGLEMAPS_API_KEY
                }

                details_response = await client.get(details_url, params=details_params)
                details_data = details_response.json()

                result = details_data.get('result', {})
                if result:
                    full_place_details.append({
                        'name': result.get('name', 'Unknown'),
                        'phone_number': result.get('formatted_phone_number', 'Not Provided'),
                        'international_phone_number': result.get('international_phone_number', 'Not Provided'),
                        'address': result.get('formatted_address', 'Unknown'),
                        'latitude': result.get('geometry', {}).get('location', {}).get('lat', 'Unknown'),
                        'longitude': result.get('geometry', {}).get('location', {}).get('lng', 'Unknown')
                    })

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"places_{place_type or 'all'}_{timestamp}.json"
        file_path = EXPORTS_DIR / filename

        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(full_place_details, f, indent=2, ensure_ascii=False)

        print(f"Saved {len(full_place_details)} detailed places to {file_path}")

        return JSONResponse(content={
            "count": len(full_place_details),
            "places": full_place_details,
            "export_info": {
                "exported": True,
                "filename": filename,
                "path": str(file_path)
            }
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e), "details": "Failed to retrieve place information"})


@router.get("/api/places/autocomplete")
async def autocomplete_place_search(
    input_text: str = Query(...),
    latitude: float = Query(None),
    longitude: float = Query(None),
):
    """
    Fetch autocomplete suggestions for places
    """
    try:
        base_url = "https://maps.googleapis.com/maps/api/place/autocomplete/json"
        params = {
            "input": input_text,
            "key": GOOGLEMAPS_API_KEY,
        }
        if latitude and longitude:
            params["location"] = f"{latitude},{longitude}"
            params["radius"] = 1000  # Optional: narrow down to 1km around user location

        async with httpx.AsyncClient() as client:
            response = await client.get(base_url, params=params)
            data = response.json()

        return JSONResponse(content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
