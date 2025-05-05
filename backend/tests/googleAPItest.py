# import requests
# import json
# import os

# # Constants
# API_KEY = "AIzaSyC7r1yEmkgD4V30Di5ba9bUQaUaEiJyPjo"  # <-- Replace this with your real key
# location = "31.770605622734422,-106.49699089260722"
# radius = 10000
# type_place = "hospital"

# # Step 1: Get nearby places
# nearby_url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={location}&radius={radius}&type={type_place}&key={API_KEY}"

# nearby_response = requests.get(nearby_url)
# nearby_data = nearby_response.json()

# places = nearby_data.get('results', [])

# full_place_details = []

# # Step 2: For each place_id, get full details
# for place in places:
#     place_id = place.get('place_id')
#     if not place_id:
#         continue

#     details_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,formatted_phone_number,international_phone_number,formatted_address,geometry&key={API_KEY}"

#     details_response = requests.get(details_url)
#     details_data = details_response.json()

#     result = details_data.get('result', {})
#     if result:
#         full_place_details.append({
#             'name': result.get('name', 'Unknown'),
#             'phone_number': result.get('formatted_phone_number', 'Not Provided'),
#             'international_phone_number': result.get('international_phone_number', 'Not Provided'),
#             'address': result.get('formatted_address', 'Unknown'),
#             'latitude': result.get('geometry', {}).get('location', {}).get('lat', 'Unknown'),
#             'longitude': result.get('geometry', {}).get('location', {}).get('lng', 'Unknown')
#         })

# # Create output directory if needed
# output_dir = os.path.dirname(os.path.abspath(__file__))
# output_file = os.path.join(output_dir, 'full_places_with_phone.json')

# # Save clean JSON without numbering
# with open(output_file, 'w', encoding='utf-8') as f:
#     json.dump(full_place_details, f, indent=2, ensure_ascii=False)

# print(f"\nSaved {len(full_place_details)} places to '{output_file}'\n")

# # Step 3: Print results nicely numbered
# for idx, place in enumerate(full_place_details, 1):
#     print(f"{idx}. {place['name']}")
#     print(f"   Address: {place['address']}")
#     print(f"   Phone: {place['phone_number']}")
#     print(f"   International Phone: {place['international_phone_number']}")
#     print(f"   Latitude: {place['latitude']}")
#     print(f"   Longitude: {place['longitude']}\n")




# import React, { useState, useEffect } from 'react';
# import { View, Text, Button, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
# import * as Location from 'expo-location';

# const PlacesSearch = () => {
#   const [location, setLocation] = useState(null);
#   const [errorMsg, setErrorMsg] = useState(null);
#   const [searchText, setSearchText] = useState('');
#   const [suggestions, setSuggestions] = useState([]);
#   const [nearbyHospitals, setNearbyHospitals] = useState([]);
#   const [loading, setLoading] = useState(false);

#   const API_URL = 'http://your-backend-url'; // Replace with your actual API URL

#   useEffect(() => {
#     (async () => {
#       // Request location permissions when component mounts
#       let { status } = await Location.requestForegroundPermissionsAsync();
#       if (status !== 'granted') {
#         setErrorMsg('Permission to access location was denied');
#         return;
#       }

#       try {
#         let location = await Location.getCurrentPositionAsync({});
#         setLocation(location);
#       } catch (error) {
#         setErrorMsg('Could not get your location');
#       }
#     })();
#   }, []);

#   // Function to fetch nearby hospitals
#   const fetchNearbyHospitals = async () => {
#     if (!location) {
#       Alert.alert('Error', 'Location not available yet.');
#       return;
#     }

#     setLoading(true);
#     try {
#       const { latitude, longitude } = location.coords;
#       const response = await fetch(
#         `${API_URL}/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000&place_type=Hospital`
#       );
      
#       if (!response.ok) {
#         throw new Error('Failed to fetch nearby hospitals');
#       }
      
#       const data = await response.json();
#       setNearbyHospitals(data.places);
#     } catch (error) {
#       Alert.alert('Error', error.message);
#     } finally {
#       setLoading(false);
#     }
#   };

#   // Function for autocomplete search
#   const handleAutocomplete = async (text) => {
#     setSearchText(text);
    
#     if (text.length < 2) {
#       setSuggestions([]);
#       return;
#     }
    
#     try {
#       let params = `input_text=${encodeURIComponent(text)}`;
      
#       // Add location if available to improve results
#       if (location) {
#         const { latitude, longitude } = location.coords;
#         params += `&latitude=${latitude}&longitude=${longitude}`;
#       }
      
#       const response = await fetch(`${API_URL}/api/places/autocomplete?${params}`);
      
#       if (!response.ok) {
#         throw new Error('Failed to fetch suggestions');
#       }
      
#       const data = await response.json();
#       setSuggestions(data.predictions || []);
#     } catch (error) {
#       console.error('Autocomplete error:', error);
#     }
#   };

#   return (
#     <View style={styles.container}>
#       <Text style={styles.header}>Find Nearby Places</Text>
      
#       {errorMsg ? (
#         <Text style={styles.errorText}>{errorMsg}</Text>
#       ) : (
#         <Text style={styles.locationText}>
#           {location ? `Current location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Getting location...'}
#         </Text>
#       )}

#       {/* Button to find nearby hospitals */}
#       <Button
#         title={loading ? "Loading..." : "Find Nearby Hospitals"}
#         onPress={fetchNearbyHospitals}
#         disabled={!location || loading}
#       />

#       {/* Autocomplete search */}
#       <TextInput
#         style={styles.input}
#         placeholder="Search for places..."
#         value={searchText}
#         onChangeText={handleAutocomplete}
#       />

#       {/* Display autocomplete suggestions */}
#       {suggestions.length > 0 && (
#         <FlatList
#           data={suggestions}
#           keyExtractor={(item) => item.place_id}
#           renderItem={({ item }) => (
#             <Text style={styles.suggestionItem}>{item.description}</Text>
#           )}
#           style={styles.suggestionList}
#         />
#       )}

#       {/* Display nearby hospitals */}
#       {nearbyHospitals.length > 0 && (
#         <View style={styles.resultsContainer}>
#           <Text style={styles.resultsHeader}>Nearby Hospitals ({nearbyHospitals.length})</Text>
#           <FlatList
#             data={nearbyHospitals}
#             keyExtractor={(item, index) => `hospital-${index}`}
#             renderItem={({ item }) => (
#               <View style={styles.placeItem}>
#                 <Text style={styles.placeName}>{item.name}</Text>
#                 <Text>{item.address}</Text>
#                 <Text>{item.phone_number}</Text>
#               </View>
#             )}
#           />
#         </View>
#       )}
#     </View>
#   );
# };

# const styles = StyleSheet.create({
#   container: {
#     flex: 1,
#     padding: 16,
#     backgroundColor: '#fff',
#   },
#   header: {
#     fontSize: 24,
#     fontWeight: 'bold',
#     marginBottom: 16,
#   },
#   locationText: {
#     marginBottom: 16,
#   },
#   errorText: {
#     color: 'red',
#     marginBottom: 16,
#   },
#   input: {
#     height: 40,
#     borderWidth: 1,
#     borderColor: '#ccc',
#     borderRadius: 8,
#     marginTop: 16,
#     marginBottom: 8,
#     paddingHorizontal: 8,
#   },
#   suggestionList: {
#     maxHeight: 200,
#     borderWidth: 1,
#     borderColor: '#eee',
#     marginBottom: 16,
#   },
#   suggestionItem: {
#     padding: 12,
#     borderBottomWidth: 1,
#     borderBottomColor: '#eee',
#   },
#   resultsContainer: {
#     marginTop: 16,
#   },
#   resultsHeader: {
#     fontSize: 18,
#     fontWeight: 'bold',
#     marginBottom: 8,
#   },
#   placeItem: {
#     padding: 12,
#     marginBottom: 8,
#     backgroundColor: '#f9f9f9',
#     borderRadius: 8,
#   },
#   placeName: {
#     fontWeight: 'bold',
#     marginBottom: 4,
#   },
# });

# export default PlacesSearch;