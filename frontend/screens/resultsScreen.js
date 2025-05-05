import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import DirectionsList from './DirectionsList'; 
import CompassComponent from './CompassComponent';
import * as Location from 'expo-location';

const PlacesSearch = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyHospital, setNearbyHospital] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState('info'); // 'info' or 'directions'

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (error) {
        setErrorMsg('Could not get your location');
      }
    })();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyHospitalAndDetails();
    }
  }, [location]);

  const fetchNearbyHospitalAndDetails = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const { latitude, longitude } = location.coords;
      
      const nearbyResponse = await fetch(
        `http://localhost:8000/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000&place_type=hospital`
      );
      if (!nearbyResponse.ok) throw new Error('Failed to fetch nearby hospitals');

      const nearbyData = await nearbyResponse.json();
      const hospitals = nearbyData.places;
      if (!hospitals || hospitals.length === 0) {
        Alert.alert('No hospitals found.');
        return;
      }

      const firstHospital = hospitals[0];
      setNearbyHospital(firstHospital);

      const detailsResponse = await fetch(
        `http://localhost:8000/api/places/details?place_id=${firstHospital.place_id}`
      );
      if (!detailsResponse.ok) throw new Error('Failed to fetch hospital details');

      const detailsData = await detailsResponse.json();
      setHospitalDetails(detailsData.result);

      const destinationLat = detailsData.result.geometry.location.lat;
      const destinationLng = detailsData.result.geometry.location.lng;

      const directionsResponse = await fetch(
        `http://localhost:8000/api/places/directions?origin_latitude=${latitude}&origin_longitude=${longitude}&destination_latitude=${destinationLat}&destination_longitude=${destinationLng}`
      );
      if (!directionsResponse.ok) throw new Error('Failed to fetch directions');

      const directionsData = await directionsResponse.json();
      setDirections(directionsData.steps);

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Find Nearest Hospital</Text>
  
      {screen === 'info' && (
        <>
          {/* Analysis Section */}
          <View style={styles.analysisBox}>
            <Text style={styles.analysisTitle}>Analysis:</Text>
            <Text style={styles.analysisText}>
              You may be experiencing a serious condition such as gastric distress combined with respiratory difficulty 
              or a more urgent issue like anaphylaxis, severe gastritis, or even cardiac-related symptoms. 
              Difficulty breathing is considered a medical emergency.
            </Text>
  
            <Text style={styles.analysisTitle}>Recommended Specialist:</Text>
            <Text style={styles.analysisText}>
              You should immediately visit an Emergency Room (ER).
              {'\n'}After stabilization, specialists who might evaluate you further include:
              {'\n'}• Emergency Medicine Doctor (immediate care)
              {'\n'}• Pulmonologist (lung specialist)
              {'\n'}• Gastroenterologist (stomach specialist)
            </Text>
  
            <Text style={styles.analysisTitle}>Home Remedies:</Text>
            <Text style={styles.analysisText}>
              • Do not attempt to self-treat breathing difficulties at home.
              {'\n'}• Sit upright to make breathing easier.
              {'\n'}• Avoid eating or drinking anything until you are evaluated by a doctor.
            </Text>
  
            <Text style={styles.emergencyText}>
              Emergency Warning:
              {'\n'}Please seek emergency care immediately by calling 911 or going to the nearest Emergency Room. 
              Difficulty breathing can be life-threatening. Do not delay.
            </Text>
          </View>
  
          {/* Error Text if any */}
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
  
          {/* Loading */}
          {loading && <ActivityIndicator size="large" color="black" style={{ marginVertical: 10 }} />}
  
          {/* Hospital Details */}
          {hospitalDetails && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Hospital Details</Text>
              <Text style={styles.detail}>Name: {hospitalDetails.name}</Text>
              <Text style={styles.detail}>Address: {hospitalDetails.formatted_address}</Text>
              <Text style={styles.detail}>Phone: {hospitalDetails.formatted_phone_number || 'N/A'}</Text>
              <Text style={styles.detail}>Coordinates: {hospitalDetails.geometry?.location?.lat}, {hospitalDetails.geometry?.location?.lng}</Text>
            </View>
          )}
  
          {/* View Directions Button */}
          {directions.length > 0 && (
            <Button
              title="View Directions"
              onPress={() => setScreen('directions')}
              color="black"
            />
          )}
        </>
      )}
  
      {screen === 'directions' && (
        <>
          <DirectionsList directions={directions} />
          <CompassComponent />
          <View style={{ marginTop: 20 }}>
            <Button
              title="Return to Hospital Info"
              onPress={() => setScreen('info')}
              color="black"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22, // slightly smaller
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },
  locationText: {
    marginBottom: 16,
    color: 'black',
    fontSize: 14, // match rest of font
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14, // match
  },
  analysisBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: 'gray',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  analysisTitle: {
    fontSize: 16, // smaller and uniform
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'black',
  },
  analysisText: {
    fontSize: 14, // make it more readable
    marginBottom: 8,
    color: 'black',
    lineHeight: 20, // slightly more spacing
  },
  emergencyText: {
    fontSize: 14,
    marginTop: 12,
    color: 'red',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  detailsBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  detail: {
    fontSize: 14,
    marginBottom: 6,
    color: 'black',
    lineHeight: 20,
  },
});
 export default PlacesSearch;