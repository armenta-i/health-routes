import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import DirectionsList from './DirectionsList'; 
import CompassComponent from './CompassComponent';
import * as Location from 'expo-location';
import config from '../config';

const PlacesSearch = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [nearbyHospital, setNearbyHospital] = useState(null);
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState('info'); // 'info' or 'directions'
  
  // Get data from navigation route
  const { 
    location: userLocation, 
    language, 
    medical_issue, 
    gemini_response 
  } = route?.params || {};

  // Function to render formatted Gemini response
  const renderFormattedResponse = (response) => {
    if (!response) return null;

    const lines = response.split('\n');
    const elements = [];
    let key = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Empty line - add spacing
        elements.push(<View key={key++} style={styles.spacing} />);
      } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        // Bold headers like **1. Possible Condition:**
        const headerText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <Text key={key++} style={styles.sectionHeader}>
            {headerText}
          </Text>
        );
      } else if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
        // Bullet points like * Call emergency services
        const bulletText = trimmedLine.replace(/^\*\s*/, '');
        elements.push(
          <Text key={key++} style={styles.bulletPoint}>
            • {bulletText}
          </Text>
        );
      } else {
        // Regular text
        const isEmergencyText = trimmedLine.toLowerCase().includes('emergency') || 
                               trimmedLine.toLowerCase().includes('911') ||
                               trimmedLine.toLowerCase().includes('immediately') ||
                               trimmedLine.toLowerCase().includes('life-threatening');
        
        elements.push(
          <Text key={key++} style={isEmergencyText ? styles.emergencyText : styles.regularText}>
            {trimmedLine}
          </Text>
        );
      }
    });

    return elements;
  };

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
        `${config.API_BASE_URL}/api/places/nearby?latitude=${latitude}&longitude=${longitude}&radius=10000&place_type=hospital`
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
        `${config.API_BASE_URL}/api/places/details?place_id=${firstHospital.place_id}`
      );
      if (!detailsResponse.ok) throw new Error('Failed to fetch hospital details');

      const detailsData = await detailsResponse.json();
      setHospitalDetails(detailsData.result);

      const destinationLat = detailsData.result.geometry.location.lat;
      const destinationLng = detailsData.result.geometry.location.lng;

      const directionsResponse = await fetch(
        `${config.API_BASE_URL}/api/places/directions?origin_latitude=${latitude}&origin_longitude=${longitude}&destination_latitude=${destinationLat}&destination_longitude=${destinationLng}`
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
      <View style={{ marginTop: 40 }} />
      <Text style={styles.header}>Find Nearest Hospital</Text>
  
      {screen === 'info' && (
        <>
          {/* Medical Advice from Gemini */}
          <View style={styles.analysisBox}>
            <Text style={styles.analysisTitle}>Medical Advice for: {medical_issue}</Text>
            <Text style={styles.analysisSubtitle}>Location: {userLocation} | Language: {language}</Text>
            
            {gemini_response ? (
              <ScrollView style={styles.responseContainer}>
                {renderFormattedResponse(gemini_response)}
              </ScrollView>
            ) : (
              <Text style={styles.analysisText}>
                Loading medical advice... Please wait while we analyze your symptoms.
              </Text>
            )}
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
  analysisSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
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
  responseContainer: {
    maxHeight: 400,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 12,
    marginBottom: 8,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    marginLeft: 8,
    lineHeight: 20,
  },
  regularText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  emergencyText: {
    fontSize: 14,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 20,
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  spacing: {
    height: 8,
  },
});
 export default PlacesSearch;