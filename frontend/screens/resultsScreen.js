import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import config from '../config';
import MapComponent from './MapComponent';
import Button from '../components/Button';

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
        
        // Check if this is a numbered section (e.g., "1. Possible Condition:")
        const numberMatch = headerText.match(/^(\d+)\.\s*(.+)/);
        if (numberMatch) {
          const [, number, title] = numberMatch;
          elements.push(
            <View key={key++} style={styles.numberedSectionContainer}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{number}</Text>
              </View>
              <Text style={styles.numberedSectionTitle}>{title}</Text>
            </View>
          );
        } else {
          elements.push(
            <Text key={key++} style={styles.sectionHeader}>
              {headerText}
            </Text>
          );
        }
      } else if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
        // Bullet points like * Call emergency services
        const bulletText = trimmedLine.replace(/^\*\s*/, '');
        elements.push(
          <Text key={key++} style={styles.bulletPoint}>
            • {bulletText}
          </Text>
        );
      } else {
        // Regular text - enhanced warning detection
        const isEmergencyText = trimmedLine.toLowerCase().includes('emergency') || 
                               trimmedLine.toLowerCase().includes('911') ||
                               trimmedLine.toLowerCase().includes('immediately') ||
                               trimmedLine.toLowerCase().includes('life-threatening') ||
                               trimmedLine.toLowerCase().includes('warning') ||
                               trimmedLine.toLowerCase().includes('urgent') ||
                               trimmedLine.toLowerCase().includes('serious') ||
                               trimmedLine.toLowerCase().includes('chest pain') ||
                               trimmedLine.toLowerCase().includes('difficulty breathing') ||
                               trimmedLine.toLowerCase().includes('severe') ||
                               trimmedLine.startsWith('**WARNING:**') ||
                               trimmedLine.includes('WARNING:');
        
        elements.push(
          <Text key={key++} style={isEmergencyText ? styles.warningText : styles.regularText}>
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
        <Text style={styles.logo}>♡ Health-Routes</Text>
        <Button
          title="← Back"
          variant="nav"
          size="small"
          onPress={() => navigation.goBack()}
        />
      </View>

      <ScrollView style={styles.container}>
        {/* Medical Advice from Gemini */}
        <View style={styles.title}>
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
              <Button
                title="Get Directions →"
                variant="primary"
                size="large"
                onPress={() => setScreen('directions')}
                style={styles.navigationButton}
              />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    padding: 24,
    paddingBottom: 40
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000'
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 32,
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
    // borderLeftWidth: 4,
    // borderLeftColor: '#000',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
  },
  hospitalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    marginTop: 20,
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
  numberedSectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  numberCircle: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  numberedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    lineHeight: 24,
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
  warningText: {
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