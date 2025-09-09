#!/usr/bin/env python3
"""
Test script for updated Google APIs - Places API (New) and Routes API
"""
import asyncio
import sys
import os

# Add the project root to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up environment
os.environ['GOOGLEMAPS_API_KEY'] = os.getenv('GOOGLEMAPS_API_KEY', 'AIzaSyD5LGrfVGWMNshsDqw-Xcj5VABee9CzlHE')

async def test_updated_apis():
    """Test the updated Google API implementations"""
    
    print("Testing Updated Google APIs Implementation")
    print("=" * 60)
    
    try:
        # Import the updated functions
        from app.core.google_routes import get_nearby_places, get_place_details, get_route_estimate, get_full_directions
        
        print("[SUCCESS] Imported updated Google API functions")
        
        # Test coordinates (NYC area)
        lat, lng = 40.7128, -74.0060
        dest_lat, dest_lng = 40.7589, -73.9851  # NYC to Central Park
        
        # Test 1: Nearby Places (New Places API)
        print(f"\n1. Testing Nearby Places (New Places API)...")
        try:
            result = await get_nearby_places(latitude=lat, longitude=lng, radius=5000, place_type="hospital")
            print(f"   Status: {result.status_code}")
            
            if result.status_code == 200:
                print("   SUCCESS: Places API (New) is working!")
            elif result.status_code == 403:
                print("   ERROR: Places API (New) not enabled - need to enable in Google Cloud Console")
                print("   -> Visit: https://console.developers.google.com/apis/api/places.googleapis.com")
            else:
                print(f"   ERROR: Unexpected status code")
        except Exception as e:
            print(f"   ERROR: {str(e)}")
        
        # Test 2: Route Estimate (New Routes API)
        print(f"\n2. Testing Route Estimate (New Routes API)...")
        try:
            result = await get_route_estimate(
                origin_latitude=lat, 
                origin_longitude=lng,
                destination_latitude=dest_lat, 
                destination_longitude=dest_lng
            )
            print(f"   Status: {result.status_code}")
            
            if result.status_code == 200:
                print("   SUCCESS: Routes API is working!")
            elif result.status_code == 403:
                print("   ERROR: Routes API not enabled - need to enable in Google Cloud Console")
                print("   -> Visit: https://console.developers.google.com/apis/api/routes.googleapis.com")
            else:
                print(f"   ERROR: Unexpected status code")
        except Exception as e:
            print(f"   ERROR: {str(e)}")
        
        # Test 3: Full Directions (New Routes API)
        print(f"\n3. Testing Full Directions (New Routes API)...")
        try:
            result = await get_full_directions(
                origin_latitude=lat, 
                origin_longitude=lng,
                destination_latitude=dest_lat, 
                destination_longitude=dest_lng
            )
            print(f"   Status: {result.status_code}")
            
            if result.status_code == 200:
                print("   SUCCESS: Routes API directions working!")
            elif result.status_code == 403:
                print("   ERROR: Routes API not enabled")
            else:
                print(f"   ERROR: Unexpected status code")
        except Exception as e:
            print(f"   ERROR: {str(e)}")
        
        # Summary
        print(f"\n4. What You Need to Enable:")
        print(f"   📍 Places API (New): https://console.developers.google.com/apis/api/places.googleapis.com")
        print(f"   🚗 Routes API: https://console.developers.google.com/apis/api/routes.googleapis.com")
        print(f"\n5. Updated Features:")
        print(f"   ✅ New Places API format (more accurate)")
        print(f"   ✅ New Routes API format (better routing)")
        print(f"   ✅ Enhanced error handling and logging")
        print(f"   ✅ Proper coordinate validation")
        print(f"   ✅ Timeout handling (30s)")
        
        print(f"\n6. Cost Comparison:")
        print(f"   Places API (New): $32/1000 requests")
        print(f"   Routes API: $10/1000 requests")
        print(f"   Monthly free: $200 credit")
        
    except ImportError as e:
        print(f"[ERROR] Import error: {e}")
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(test_updated_apis())