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
GOOGLEMAPS_API_KEY = os.getenv("GOOGLEMAPS_API_KEY")

if not GOOGLEMAPS_API_KEY:
    logger.error("GOOGLEMAPS_API_KEY not found in environment variables")
    raise ValueError("Google Maps API key is required")

# Helper function to get country code from coordinates using reverse geocoding
async def get_country_code_from_coordinates(latitude: float, longitude: float) -> str:
    """
    Get country code from coordinates using Google Geocoding API
    Returns 2-letter country code (e.g., 'US', 'CA', 'MX')
    """
    try:
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "latlng": f"{latitude},{longitude}",
            "key": GOOGLEMAPS_API_KEY,
            "result_type": "country"
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'OK' and data.get('results'):
                    # Extract country code from the first result
                    for component in data['results'][0].get('address_components', []):
                        if 'country' in component.get('types', []):
                            country_code = component.get('short_name', 'US')
                            logger.info(f"Found country code: {country_code} for coordinates ({latitude}, {longitude})")
                            return country_code
                            
        logger.warning(f"Could not determine country code for coordinates ({latitude}, {longitude}), defaulting to US")
        return 'US'  # Default fallback
        
    except Exception as e:
        logger.error(f"Error getting country code: {str(e)}, defaulting to US")
        return 'US'  # Default fallback

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
        
        # Request body for new API with country restriction
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
            },
            "regionCode": await get_country_code_from_coordinates(latitude, longitude)
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
        
        # New Routes API format
        url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        
        request_body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": origin_latitude,
                        "longitude": origin_longitude
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": destination_latitude,
                        "longitude": destination_longitude
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE"
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLEMAPS_API_KEY,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline"
        }
        
        logger.info(f"Making request to Google Routes API: {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=request_body, headers=headers)
            
            logger.info(f"Google Routes API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Routes API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Routes API error: {response.status_code}"}
                )
            
            data = response.json()
            
            # Handle errors for new Routes API
            if 'error' in data:
                error = data['error']
                error_message = error.get('message', 'Unknown error')
                error_code = error.get('code', 'UNKNOWN')
                logger.error(f"Google Routes API error - Code: {error_code}, Message: {error_message}")
                
                if error_code == 403 or 'API key' in error_message:
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Routes API not enabled"}
                    )
                elif error_code == 429 or 'quota' in error_message.lower():
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                elif 'not found' in error_message.lower():
                    return JSONResponse(
                        status_code=404, 
                        content={"error": "One or more locations could not be geocoded"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Routes API error: {error_message}"}
                    )

        # Parse new Routes API response
        if data.get('routes'):
            try:
                route = data['routes'][0]
                
                # Convert duration from seconds format (e.g., "1234s") to readable format
                duration_seconds = int(route.get('duration', '0s').rstrip('s'))
                duration_minutes = duration_seconds // 60
                duration_hours = duration_minutes // 60
                
                if duration_hours > 0:
                    duration_text = f"{duration_hours} hr {duration_minutes % 60} min"
                else:
                    duration_text = f"{duration_minutes} min"
                
                # Convert distance from meters to miles/feet only
                distance_meters = route.get('distanceMeters', 0)
                distance_miles = distance_meters * 0.000621371  # Convert meters to miles
                if distance_miles >= 1:
                    distance_text = f"{distance_miles:.1f} mi"
                else:  # For all distances under 1 mile, show feet
                    distance_feet = distance_meters * 3.28084
                    distance_text = f"{distance_feet:.0f} ft"
                
                result = {
                    "duration": duration_text,
                    "distance": distance_text,
                    "start_address": f"{origin_latitude},{origin_longitude}",  # Routes API doesn't return addresses by default
                    "end_address": f"{destination_latitude},{destination_longitude}"
                }
                logger.info(f"Successfully calculated route: {result['distance']}, {result['duration']}")
                return JSONResponse(content=result)
            except (KeyError, IndexError, ValueError) as e:
                logger.error(f"Error parsing route data: {str(e)}")
                return JSONResponse(status_code=502, content={"error": "Invalid route data from Google API"})

        logger.info("No routes found in API response")
        return JSONResponse(content={"message": "No route found."})

    except httpx.TimeoutException:
        logger.error("Request to Google Routes API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Routes API: {str(e)}")
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
        
        # New Routes API format for detailed directions
        url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        
        request_body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": origin_latitude,
                        "longitude": origin_longitude
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": destination_latitude,
                        "longitude": destination_longitude
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE"
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLEMAPS_API_KEY,
            "X-Goog-FieldMask": "routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration"
        }
        
        logger.info(f"Making request to Google Routes API: {url}")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=request_body, headers=headers)
            
            logger.info(f"Google Routes API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Google Routes API returned status {response.status_code}: {response.text}")
                return JSONResponse(
                    status_code=502, 
                    content={"error": f"Google Routes API error: {response.status_code}"}
                )
            
            data = response.json()
            
            # Handle errors for new Routes API
            if 'error' in data:
                error = data['error']
                error_message = error.get('message', 'Unknown error')
                error_code = error.get('code', 'UNKNOWN')
                logger.error(f"Google Routes API error - Code: {error_code}, Message: {error_message}")
                
                if error_code == 403 or 'API key' in error_message:
                    return JSONResponse(
                        status_code=403, 
                        content={"error": "API key invalid or Routes API not enabled"}
                    )
                elif error_code == 429 or 'quota' in error_message.lower():
                    return JSONResponse(
                        status_code=429, 
                        content={"error": "API quota exceeded"}
                    )
                elif 'not found' in error_message.lower():
                    return JSONResponse(
                        status_code=404, 
                        content={"error": "One or more locations could not be geocoded"}
                    )
                else:
                    return JSONResponse(
                        status_code=502, 
                        content={"error": f"Google Routes API error: {error_message}"}
                    )

        # Extract steps from new Routes API format
        steps = []
        if data.get('routes'):
            try:
                # New Routes API structure: routes[0].legs[0].steps
                legs = data['routes'][0].get('legs', [])
                if legs:
                    route_steps = legs[0].get('steps', [])
                    logger.info(f"Processing {len(route_steps)} direction steps")
                    
                    for step in route_steps:
                        # Convert duration from seconds format
                        duration_seconds = int(step.get('staticDuration', '0s').rstrip('s'))
                        duration_minutes = duration_seconds // 60
                        
                        if duration_minutes > 0:
                            duration_text = f"{duration_minutes} min"
                        else:
                            duration_text = "< 1 min"
                        
                        # Convert distance from meters to miles/feet only
                        distance_meters = step.get('distanceMeters', 0)
                        distance_miles = distance_meters * 0.000621371  # Convert meters to miles
                        if distance_miles >= 1:
                            distance_text = f"{distance_miles:.1f} mi"
                        else:  # For all distances under 1 mile, show feet
                            distance_feet = distance_meters * 3.28084
                            distance_text = f"{distance_feet:.0f} ft"
                        
                        # Get navigation instruction
                        nav_instruction = step.get('navigationInstruction', {})
                        instruction = nav_instruction.get('instructions', 'Continue straight')
                        
                        steps.append({
                            "instruction": instruction,
                            "distance": distance_text,
                            "duration": duration_text
                        })
                        
                    logger.info(f"Successfully processed {len(steps)} direction steps")
                else:
                    logger.warning("No legs found in route")
            except (KeyError, IndexError, ValueError) as e:
                logger.error(f"Error parsing directions data: {str(e)}")
                return JSONResponse(status_code=502, content={"error": "Invalid directions data from Google API"})
        else:
            logger.info("No routes found in API response")

        return JSONResponse(content={"steps": steps})

    except httpx.TimeoutException:
        logger.error("Request to Google Routes API timed out")
        return JSONResponse(status_code=504, content={"error": "Request timed out"})
    except httpx.NetworkError as e:
        logger.error(f"Network error connecting to Google Routes API: {str(e)}")
        return JSONResponse(status_code=502, content={"error": "Network connection error"})
    except Exception as e:
        logger.error(f"Unexpected error in full directions endpoint: {str(e)}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal server error"})