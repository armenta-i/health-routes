#!/usr/bin/env python3
"""
Test script for Directions API - both legacy and new Routes API
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLEMAPS_API_KEY")

async def test_directions_apis():
    print("Testing Directions/Routes APIs")
    print("=" * 50)
    
    # Test coordinates (NYC to Central Park)
    origin_lat, origin_lng = 40.7128, -74.0060
    dest_lat, dest_lng = 40.7829, -73.9654
    
    print(f"Route: ({origin_lat},{origin_lng}) to ({dest_lat},{dest_lng})")
    
    # Test 1: Legacy Directions API
    print("\n1. Testing Legacy Directions API...")
    legacy_url = f"https://maps.googleapis.com/maps/api/directions/json"
    legacy_params = {
        "origin": f"{origin_lat},{origin_lng}",
        "destination": f"{dest_lat},{dest_lng}",
        "key": API_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(legacy_url, params=legacy_params)
            print(f"   Status: {response.status_code}")
            
            data = response.json()
            if response.status_code == 200 and data.get('status') == 'OK':
                route = data['routes'][0]['legs'][0]
                print(f"   SUCCESS: {route['distance']['text']}, {route['duration']['text']}")
            else:
                print(f"   ERROR: {data.get('error_message', data.get('status', 'Unknown error'))}")
                if 'legacy' in data.get('error_message', '').lower():
                    print("   -> Need to enable legacy Directions API in Google Cloud Console")
    except Exception as e:
        print(f"   ERROR: {str(e)}")
    
    # Test 2: New Routes API
    print("\n2. Testing New Routes API...")
    routes_url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    
    request_body = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": origin_lat,
                    "longitude": origin_lng
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": dest_lat,
                    "longitude": dest_lng
                }
            }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE"
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.legs.steps"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(routes_url, json=request_body, headers=headers)
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'routes' in data and len(data['routes']) > 0:
                    route = data['routes'][0]
                    distance_km = route.get('distanceMeters', 0) / 1000
                    duration_min = int(route.get('duration', '0s').rstrip('s')) / 60
                    print(f"   SUCCESS: {distance_km:.1f} km, {duration_min:.0f} minutes")
                else:
                    print("   ERROR: No routes found")
            else:
                data = response.json()
                error = data.get('error', {})
                print(f"   ERROR: {error.get('message', 'Unknown error')}")
                if 'not been used' in error.get('message', ''):
                    print("   -> Need to enable Routes API in Google Cloud Console")
    except Exception as e:
        print(f"   ERROR: {str(e)}")
    
    # Summary
    print(f"\n3. Summary:")
    print(f"   API Key: {API_KEY[:20]}...")
    print(f"   Options:")
    print(f"   - Enable legacy 'Directions API' (cheaper: $5/1000 requests)")
    print(f"   - Enable new 'Routes API' (more expensive: $10/1000 requests)")
    print(f"   - Both APIs need to be enabled in Google Cloud Console")

if __name__ == "__main__":
    asyncio.run(test_directions_apis())