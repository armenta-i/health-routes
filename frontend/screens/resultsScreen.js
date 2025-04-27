import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

const PlacesSearch = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchNearbyHospitals = async () => {
    if (!location) {
      Alert.alert('Error', 'Location not available yet.');
      return;
    }

    setLoading(true);
    try {
      const { latitude, longitude } = location.coords;
      const response = await fetch(
        `http://172.20.44.22:8000/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000&place_type=hospital&keyword=hospital`
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
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            <Text style={styles.header}>Find Nearby Hospitals</Text>

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
              title={loading ? "Loading..." : "Find Nearby Hospitals"}
              onPress={fetchNearbyHospitals}
              disabled={!location || loading}
            />

            {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />}
          </>
        }
        data={nearbyHospitals}
        keyExtractor={(item, index) => `hospital-${index}`}
        renderItem={({ item }) => (
          <View style={styles.placeItem}>
            <Text style={styles.placeName}>{item.name}</Text>
            <Text>{item.address}</Text>
            <Text>{item.phone_number}</Text>
          </View>
        )}
        ListEmptyComponent={!loading && (
          <Text style={styles.emptyText}>No hospitals found nearby.</Text>
        )}
      />
    </View>
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});

export default PlacesSearch;
