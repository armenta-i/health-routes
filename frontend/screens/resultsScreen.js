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

  const fetchNearbyHospitalAndDetails = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available yet.');
      return;
    }

    setLoading(true);
    try {
      const { latitude, longitude } = location.coords;
      
      // Step 1
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

      // Step 2
      const detailsResponse = await fetch(
        `http://localhost:8000/api/places/details?place_id=${firstHospital.place_id}`
      );
      if (!detailsResponse.ok) throw new Error('Failed to fetch hospital details');

      const detailsData = await detailsResponse.json();
      setHospitalDetails(detailsData.result);

      // Step 3
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

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <Text style={styles.locationText}>
          {location 
            ? `Current location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
            : 'Getting location...'}
        </Text>
      )}

      <Button
        title={loading ? "Loading..." : "Find Nearest Hospital"}
        onPress={fetchNearbyHospitalAndDetails}
        disabled={!location || loading}
      />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />}

      {/* Screen Controller */}
      {screen === 'info' && (
        <>

          {hospitalDetails && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsTitle}>Step 2: Hospital Full Details</Text>
              <Text style={styles.detail}>Name: {hospitalDetails.name}</Text>
              <Text style={styles.detail}>Address: {hospitalDetails.formatted_address}</Text>
              <Text style={styles.detail}>Phone: {hospitalDetails.formatted_phone_number || 'N/A'}</Text>
              <Text style={styles.detail}>Coordinates: {hospitalDetails.geometry?.location?.lat}, {hospitalDetails.geometry?.location?.lng}</Text>
            </View>
          )}

          {directions.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Button
                title="View Directions"
                onPress={() => setScreen('directions')}
              />
            </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  locationText: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
  },
  detailsBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 6,
  },
});

export default PlacesSearch;
