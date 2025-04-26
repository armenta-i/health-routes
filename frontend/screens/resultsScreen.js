import React, { useState, useEffect} from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';

const PlacesSearch = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:8000'; // Replace with your actual API URL

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
      } catch (error) {
        setErrorMsg('Could not get your location');
      }
    })();
  }, []);

  // Fetch nearby hospitals
  const fetchNearbyHospitals = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available yet.');
      return;
    }

    setLoading(true);
    try {
      const { latitude, longitude } = location.coords;
      const response = await fetch(
        `${API_URL}/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000&place_type=Hospital`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby hospitals');
      }
      
      const data = await response.json();
      setNearbyHospitals(data.places);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.header}>Find Nearby Hospitals</Text>
      
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <Text style={styles.locationText}>
          {location ? `Current location: ${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Getting location...'}
        </Text>
      )}

      <Button
        title={loading ? "Loading..." : "Find Nearby Hospitals"}
        onPress={fetchNearbyHospitals}
        disabled={!location || loading}
      />

      {/* Display nearby hospitals */}
      {nearbyHospitals.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>Nearby Hospitals ({nearbyHospitals.length})</Text>
          <FlatList
            data={nearbyHospitals}
            keyExtractor={(item, index) => `hospital-${index}`}
            renderItem={({ item }) => (
              <View style={styles.placeItem}>
                <Text style={styles.placeName}>{item.name}</Text>
                <Text>{item.address}</Text>
                <Text>{item.phone_number}</Text>
              </View>
            )}
          />
        </View>
      )}
    </View>
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
  resultsContainer: {
    marginTop: 16,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeItem: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  placeName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default PlacesSearch;
