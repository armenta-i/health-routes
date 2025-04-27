import requests
import json
import os

# Constants
API_KEY = "AIzaSyC7r1yEmkgD4V30Di5ba9bUQaUaEiJyPjo"  # <-- Replace this with your real key
location = "31.770605622734422,-106.49699089260722"
radius = 10000
type_place = "hospital"

# Step 1: Get nearby places
nearby_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={type_place}&key={API_KEY}"

nearby_response = requests.get(nearby_url)
nearby_data = nearby_response.json()

places = nearby_data.get('results', [])

full_place_details = []

# Step 2: For each place_id, get full details
for place in places:
    place_id = place.get('place_id')
    if not place_id:
        continue

    details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,geometry&key={API_KEY}"

    details_response = requests.get(details_url)
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

# Create output directory if needed
output_dir = os.path.dirname(os.path.abspath(__file__))
output_file = os.path.join(output_dir, 'full_places_with_phone.json')

# Save clean JSON without numbering
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(full_place_details, f, indent=2, ensure_ascii=False)

print(f"\nSaved {len(full_place_details)} places to '{output_file}'\n")

# Step 3: Print results nicely numbered
for idx, place in enumerate(full_place_details, 1):
    print(f"{idx}. {place['name']}")
    print(f"   Address: {place['address']}")
    print(f"   Phone: {place['phone_number']}")
    print(f"   International Phone: {place['international_phone_number']}")
    print(f"   Latitude: {place['latitude']}")
    print(f"   Longitude: {place['longitude']}\n")


a2q