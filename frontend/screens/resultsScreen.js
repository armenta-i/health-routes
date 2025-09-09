import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import DirectionsList from './DirectionsList'; 
import CompassComponent from './CompassComponent';
import * as Location from 'expo-location';
import config from '../config';
import MapComponent from './MapComponent';

const PlacesSearch = ({ route, navigation }) => {
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

  if (screen === 'directions' && hospitalDetails) {
    return (
      <MapComponent 
        destination={{
          latitude: hospitalDetails.geometry.location.lat,
          longitude: hospitalDetails.geometry.location.lng
        }}
        directions={directions}
        hospitalDetails={hospitalDetails}
        onBackPress={() => setScreen('info')}
        onHomePress={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.homeButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Medical Assessment Results</Text>
        <Text style={styles.subtitle}>
          Here are your personalized healthcare recommendations and nearby hospital information.
        </Text>
  
        {/* Medical Advice from Gemini */}
        <View style={styles.medicalAdviceSection}>
          <Text style={styles.sectionTitle}>Medical Advice</Text>
          <Text style={styles.conditionText}>Condition: {medical_issue}</Text>
          <Text style={styles.locationText}>Location: {userLocation} | Language: {language}</Text>
          
          {gemini_response ? (
            <View style={styles.adviceContainer}>
              {renderFormattedResponse(gemini_response)}
            </View>
          ) : (
            <View style={styles.loadingAdvice}>
              <ActivityIndicator size="small" color="#666" />
              <Text style={styles.loadingText}>
                Loading medical advice... Please wait while we analyze your symptoms.
              </Text>
            </View>
          )}
        </View>

        {/* Error Display */}
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Loading Hospital Info */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Finding nearest hospital...</Text>
          </View>
        )}

        {/* Hospital Details */}
        {hospitalDetails && (
          <View style={styles.hospitalSection}>
            <Text style={styles.sectionTitle}>Nearest Hospital</Text>
            <View style={styles.hospitalCard}>
              <Text style={styles.hospitalName}>{hospitalDetails.name}</Text>
              <Text style={styles.hospitalDetail}>Address: {hospitalDetails.formatted_address}</Text>
              <Text style={styles.hospitalDetail}>Phone: {hospitalDetails.formatted_phone_number || 'N/A'}</Text>
            </View>
            
            {/* Navigation Button */}
            {directions.length > 0 && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => setScreen('directions')}
              >
                <Text style={styles.navigationButtonText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  homeButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22
  },
  
  // Medical Advice Section
  medicalAdviceSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000'
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16
  },
  adviceContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  loadingAdvice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  
  // Error Handling
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600'
  },
  
  // Loading States
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  
  // Hospital Section
  hospitalSection: {
    marginBottom: 32,
  },
  hospitalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12
  },
  hospitalDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20
  },
  navigationButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Response formatting (keeping existing ones for Gemini response)
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