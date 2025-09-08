#!/usr/bin/env python3
"""
Test script for the new Places API implementation
Run this after enabling Places API (New) in Google Cloud Console
"""
import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GOOGLEMAPS_API_KEY")

async def test_new_places_api():
    print("Testing New Places API Implementation")
    print("=" * 50)
    
    # Test 1: Search Nearby Places
    print("\n1. Testing nearby places search...")
    url = "https://places.googleapis.com/v1/places:searchNearby"
    
    request_body = {
        "includedTypes": ["hospital"],
        "maxResultCount": 5,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "radius": 5000
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.id"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=request_body, headers=headers)
            
            print(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                places = data.get('places', [])
                print(f"   Found {len(places)} places")
                
                for i, place in enumerate(places[:3], 1):  # Show first 3
                    name = place.get('displayName', {}).get('text', 'Unknown')
                    address = place.get('formattedAddress', 'Unknown')
                    print(f"   {i}. {name} - {address}")
                    
            else:
                data = response.json()
                if 'error' in data:
                    error = data['error']
                    print(f"   Error: {error.get('message', 'Unknown error')}")
                    if 'not been used' in error.get('message', ''):
                        print("   → You need to enable Places API (New) in Google Cloud Console")
                        print(f"   → Visit: https://console.developers.google.com/apis/api/places.googleapis.com/overview")
    
    except Exception as e:
        print(f"   Error: {str(e)}")
    
    # Test 2: Place Details (if nearby search worked)
    print("\n2. Testing place details...")
    print("   This will only work after nearby search returns valid place IDs")
    
    print(f"\n3. Your API Key: {API_KEY[:20]}...")
    print(f"   API Key Status: {'Valid format' if API_KEY and len(API_KEY) > 30 else 'Invalid or missing'}")

if __name__ == "__main__":
    asyncio.run(test_new_places_api())