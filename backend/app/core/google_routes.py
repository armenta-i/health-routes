from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import httpx
import os
import logging
from dotenv import load_dotenv

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load API Key
load_dotenv()
# GOOGLEMAPS_API_KEY = os.getenv("GOOGLEMAPS_API_KEY")

# if not GOOGLEMAPS_API_KEY:
#     logger.error("GOOGLEMAPS_API_KEY not found in environment variables")
#     raise ValueError("Google Maps API key is required")

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
    logger.info(f"Nearby places request: lat={latitude}, lng={longitude}, radius={radius}, type={place_type}")
    
    try:
        if not (-90 <= latitude <= 90):
            logger.error(f"Invalid latitude: {latitude}")
            return JSONResponse(status_code=400, content={"error": "Latitude must be between -90 and 90"})
        
        if not (-180 <= longitude <= 180):
            logger.error(f"Invalid longitude: {longitude}")
            return JSONResponse(status_code=400, content={"error": "Longitude must be between -180 and 180"})
        
        if radius <= 0 or radius > 50000:
            logger.error(f"Invalid radius: {radius}")
            return JSONResponse(status_code=400, content={"error": "Radius must be between 1 and 50000 meters"})

        # New Places API (New) format
        url = "https://places.googleapis.com/v1/places:searchNearby"
        
        # Request body for new API
        request_body = {
            "includedTypes": [place_type.lower()],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    "radius": radius
                }
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLEMAPS_API_KEY,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.id"
        }
        
        logger.info(f"Making request to Google Places API (New): {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=request_body, headers=headers)
            
            logger.info(f"Google Places API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Places API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Places API error: {response.status_code}"}
                )
            
            data = response.json()
            
            # New API returns different error structure
            if 'error' in data:
                error = data['error']
                error_message = error.get('message', 'Unknown error')
                error_code = error.get('code', 'UNKNOWN')
                logger.error(f"Google Places API (New) error - Code: {error_code}, Message: {error_message}")
                
                if error_code == 403 or 'API key' in error_message:
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Places API (New) not enabled"}
                    )
                elif error_code == 429 or 'quota' in error_message.lower():
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Places API error: {error_message}"}
                    )

        places = []
        results = data.get('places', [])
        logger.info(f"Found {len(results)} places")
        
        # Handle empty results
        if not results:
            logger.info("No places found for the given criteria")
            return JSONResponse(content={"places": []})
        
        for place in results:
            places.append({
                "place_id": place.get("id"),
                "name": place.get("displayName", {}).get("text", "Unknown"),
                "address": place.get("formattedAddress", "Unknown"),
                "latitude": place.get("location", {}).get("latitude"),
                "longitude": place.get("location", {}).get("longitude"),
                "rating": place.get("rating", "N/A")
            })

        return JSONResponse(content={"places": places})

    except httpx.TimeoutException:
        logger.error("Request to Google Places API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Places API: {str(e)}")
        return JSONResponse(status_code=502, content={"error": "Network connection error"})
    except Exception as e:
        logger.error(f"Unexpected error in nearby places endpoint: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal server error"})

# ---------------------------------
# 2. Place Details Lookup
# ---------------------------------
@router.get("/api/places/details")
async def get_place_details(
    place_id: str = Query(...)
):
    logger.info(f"Place details request for place_id: {place_id}")
    
    try:
        if not place_id or len(place_id.strip()) == 0:
            logger.error("Empty or invalid place_id provided")
            return JSONResponse(status_code=400, content={"error": "place_id is required"})
        
        # New Places API (New) format for place details
        url = f"https://places.googleapis.com/v1/places/{place_id}"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLEMAPS_API_KEY,
            "X-Goog-FieldMask": "displayName,formattedAddress,location,nationalPhoneNumber,internationalPhoneNumber"
        }
        
        logger.info(f"Making request to Google Places Details API (New): {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            
            logger.info(f"Google Places Details API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Places Details API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Places Details API error: {response.status_code}"}
                )
            
            data = response.json()
            
            # Handle errors for new API
            if 'error' in data:
                error = data['error']
                error_message = error.get('message', 'Unknown error')
                error_code = error.get('code', 'UNKNOWN')
                logger.error(f"Google Places Details API (New) error - Code: {error_code}, Message: {error_message}")
                
                if error_code == 403 or 'API key' in error_message:
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Places API (New) not enabled"}
                    )
                elif error_code == 429 or 'quota' in error_message.lower():
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                elif error_code == 404 or 'not found' in error_message.lower():
                    logger.warning(f"Place not found for place_id: {place_id}")
                    return JSONResponse(
                        status_code=404, 
                        content={"error": "Place not found"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Places Details API error: {error_message}"}
                    )
        
        # Transform response to match expected format
        result = {
            "result": {
                "name": data.get("displayName", {}).get("text", "Unknown"),
                "formatted_address": data.get("formattedAddress", "Unknown"),
                "formatted_phone_number": data.get("nationalPhoneNumber", "Not available"),
                "international_phone_number": data.get("internationalPhoneNumber", "Not available"),
                "geometry": {
                    "location": {
                        "lat": data.get("location", {}).get("latitude"),
                        "lng": data.get("location", {}).get("longitude")
                    }
                }
            },
            "status": "OK"
        }
        
        logger.info(f"Successfully retrieved details for place_id: {place_id}")
        return JSONResponse(content=result)

    except httpx.TimeoutException:
        logger.error("Request to Google Places Details API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Places Details API: {str(e)}")
        return JSONResponse(status_code=502, content={"error": "Network connection error"})
    except Exception as e:
        logger.error(f"Unexpected error in place details endpoint: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal server error"})

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
    logger.info(f"Route estimate request: origin=({origin_latitude},{origin_longitude}), destination=({destination_latitude},{destination_longitude})")
    
    try:
        # Validate coordinates
        coordinates = [
            ("origin_latitude", origin_latitude),
            ("origin_longitude", origin_longitude), 
            ("destination_latitude", destination_latitude),
            ("destination_longitude", destination_longitude)
        ]
        
        for name, value in coordinates:
            if "latitude" in name and not (-90 <= value <= 90):
                logger.error(f"Invalid {name}: {value}")
                return JSONResponse(status_code=400, content={"error": f"{name} must be between -90 and 90"})
            elif "longitude" in name and not (-180 <= value <= 180):
                logger.error(f"Invalid {name}: {value}")
                return JSONResponse(status_code=400, content={"error": f"{name} must be between -180 and 180"})
        
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{origin_latitude},{origin_longitude}",
            "destination": f"{destination_latitude},{destination_longitude}",
            "key": GOOGLEMAPS_API_KEY
        }
        
        logger.info(f"Making request to Google Directions API: {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            logger.info(f"Google Directions API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Directions API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Directions API error: {response.status_code}"}
                )
            
            data = response.json()
            
            if data.get('status') != 'OK':
                error_message = data.get('error_message', 'Unknown error')
                status = data.get('status')
                logger.error(f"Google Directions API error - Status: {status}, Message: {error_message}")
                
                if status == 'REQUEST_DENIED':
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Directions API not enabled"}
                    )
                elif status == 'OVER_QUERY_LIMIT':
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                elif status == 'ZERO_RESULTS':
                    logger.info("No route found between the specified locations")
                    return JSONResponse(content={"message": "No route found."})
                elif status == 'NOT_FOUND':
                    return JSONResponse(
                        status_code=404, 
                        content={"error": "One or more locations could not be geocoded"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Directions API error: {error_message}"}
                    )

        # Only return minimal: duration and distance
        if data.get('routes'):
            try:
                leg = data['routes'][0]['legs'][0]
                result = {
                    "duration": leg['duration']['text'],
                    "distance": leg['distance']['text'],
                    "start_address": leg['start_address'],
                    "end_address": leg['end_address']
                }
                logger.info(f"Successfully calculated route: {result['distance']}, {result['duration']}")
                return JSONResponse(content=result)
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing route data: {str(e)}")
                return JSONResponse(status_code=502, content={"error": "Invalid route data from Google API"})

        logger.info("No routes found in API response")
        return JSONResponse(content={"message": "No route found."})

    except httpx.TimeoutException:
        logger.error("Request to Google Directions API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Directions API: {str(e)}")
        return JSONResponse(status_code=502, content={"error": "Network connection error"})
    except Exception as e:
        logger.error(f"Unexpected error in route estimate endpoint: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal server error"})

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
    logger.info(f"Full directions request: origin=({origin_latitude},{origin_longitude}), destination=({destination_latitude},{destination_longitude})")
    
    try:
        # Validate coordinates
        coordinates = [
            ("origin_latitude", origin_latitude),
            ("origin_longitude", origin_longitude), 
            ("destination_latitude", destination_latitude),
            ("destination_longitude", destination_longitude)
        ]
        
        for name, value in coordinates:
            if "latitude" in name and not (-90 <= value <= 90):
                logger.error(f"Invalid {name}: {value}")
                return JSONResponse(status_code=400, content={"error": f"{name} must be between -90 and 90"})
            elif "longitude" in name and not (-180 <= value <= 180):
                logger.error(f"Invalid {name}: {value}")
                return JSONResponse(status_code=400, content={"error": f"{name} must be between -180 and 180"})
        
        url = "https://maps.googleapis.com/maps/api/directions/json"
        params = {
            "origin": f"{origin_latitude},{origin_longitude}",
            "destination": f"{destination_latitude},{destination_longitude}",
            "key": GOOGLEMAPS_API_KEY
        }
        
        logger.info(f"Making request to Google Directions API: {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            logger.info(f"Google Directions API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Directions API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Directions API error: {response.status_code}"}
                )
            
            data = response.json()
            
            if data.get('status') != 'OK':
                error_message = data.get('error_message', 'Unknown error')
                status = data.get('status')
                logger.error(f"Google Directions API error - Status: {status}, Message: {error_message}")
                
                if status == 'REQUEST_DENIED':
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Directions API not enabled"}
                    )
                elif status == 'OVER_QUERY_LIMIT':
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                elif status == 'ZERO_RESULTS':
                    logger.info("No directions found between the specified locations")
                    return JSONResponse(content={"steps": []})
                elif status == 'NOT_FOUND':
                    return JSONResponse(
                        status_code=404, 
                        content={"error": "One or more locations could not be geocoded"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Directions API error: {error_message}"}
                    )

        # Extract steps nicely
        steps = []
        if data.get('routes'):
            try:
                route_steps = data['routes'][0]['legs'][0]['steps']
                logger.info(f"Processing {len(route_steps)} direction steps")
                
                for step in route_steps:
                    steps.append({
                        "instruction": step.get('html_instructions', ''),
                        "distance": step.get('distance', {}).get('text', ''),
                        "duration": step.get('duration', {}).get('text', '')
                    })
                    
                logger.info(f"Successfully processed {len(steps)} direction steps")
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing directions data: {str(e)}")
                return JSONResponse(status_code=502, content={"error": "Invalid directions data from Google API"})
        else:
            logger.info("No routes found in API response")

        return JSONResponse(content={"steps": steps})

    except httpx.TimeoutException:
        logger.error("Request to Google Directions API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Directions API: {str(e)}")
        return JSONResponse(status_code=502, content={"error": "Network connection error"})
    except Exception as e:
        logger.error(f"Unexpected error in full directions endpoint: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal server error"})