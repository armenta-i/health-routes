from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import httpx
import os
from dotenv import load_dotenv\

router = APIRouter()

# Load API Key
load_dotenv()
GOOGLEMAPS_API_KEY = os.getenv("GOOGLEMAPS_API_KEY")

# ---------------------------------
# 1. Places Nearby Search
# ---------------------------------
@router.get("/api/places/nearby")
async def get_nearby_places(
    latitude: float = Query(...),
    longitude: float = Query(...),
    radius: int = Query(10000),
    place_type: str = Query("hospital"),
):
    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{latitude},{longitude}",
            "radius": radius,
            "type": place_type,
            "key": GOOGLEMAPS_API_KEY
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        places = []
        for place in data.get('results', []):
            places.append({
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "latitude": place.get("geometry", {}).get("location", {}).get("lat"),
                "longitude": place.get("geometry", {}).get("location", {}).get("lng"),
                "rating": place.get("rating", "N/A")
            })

        return JSONResponse(content={"places": places})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------------------------------
# 2. Place Details Lookup
# ---------------------------------
@router.get("/api/places/details")
async def get_place_details(
    place_id: str = Query(...)
):
    try:
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_phone_number,international_phone_number,formatted_address,geometry",
            "key": GOOGLEMAPS_API_KEY
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        return JSONResponse(content=data)

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------------------------------
# 3. Routes (Distance Estimation)
# (simplified as a direct directions call here)
# ---------------------------------
@router.get("/api/places/routes")
async def get_route_estimate(
    origin_latitude: float = Query(...),
    origin_longitude: float = Query(...),
    destination_latitude: float = Query(...),
    destination_longitude: float = Query(...)
):
    try:
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{origin_latitude},{origin_longitude}",
            "destination": f"{destination_latitude},{destination_longitude}",
            "key": GOOGLEMAPS_API_KEY
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        # Only return minimal: duration and distance
        if data.get('routes'):
            leg = data['routes'][0]['legs'][0]
            result = {
                "duration": leg['duration']['text'],
                "distance": leg['distance']['text'],
                "start_address": leg['start_address'],
                "end_address": leg['end_address']
            }
            return JSONResponse(content=result)

        return JSONResponse(content={"message": "No route found."})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# ---------------------------------
# 4. Full Directions (Step-by-step)
# ---------------------------------
@router.get("/api/places/directions")
async def get_full_directions(
    origin_latitude: float = Query(...),
    origin_longitude: float = Query(...),
    destination_latitude: float = Query(...),
    destination_longitude: float = Query(...)
):
    try:
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{origin_latitude},{origin_longitude}",
            "destination": f"{destination_latitude},{destination_longitude}",
            "key": GOOGLEMAPS_API_KEY
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()

        # Extract steps nicely
        steps = []
        if data.get('routes'):
            for step in data['routes'][0]['legs'][0]['steps']:
                steps.append({
                    "instruction": step.get('html_instructions', ''),
                    "distance": step.get('distance', {}).get('text', ''),
                    "duration": step.get('duration', {}).get('text', '')
                })

        return JSONResponse(content={"steps": steps})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})