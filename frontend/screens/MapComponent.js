import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import config from '../config';
import Button from '../components/Button';

const MapComponent = ({ 
  destination: propDestination, 
  directions = [], 
  hospitalDetails = null, 
  onBackPress,
  onHomePress 
}) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [routeInfo, setRouteInfo] = useState({ distance: '', duration: '' });
  const [isNavigating, setIsNavigating] = useState(false);
  const [showDirectionsList, setShowDirectionsList] = useState(false);
  const mapRef = useRef(null);

  const destination = propDestination || {
    latitude: 31.7680,
    longitude: -106.4400
  };

  useEffect(() => {
    startLocationTracking();
    return () => {
      // Cleanup location subscription
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Fetch new route when current location changes
    if (currentLocation) {
      fetchDirections(currentLocation, destination);
      
      // Update current navigation step based on proximity
      if (isNavigating && navigationSteps.length > 0) {
        updateCurrentStep();
      }
      
      // Center map on current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    }
  }, [currentLocation]);

  const updateCurrentStep = () => {
    if (!currentLocation || navigationSteps.length === 0) return;

    // Find closest upcoming step
    let closestStepIndex = currentStep;
    let minDistance = Infinity;

    for (let i = currentStep; i < navigationSteps.length; i++) {
      const step = navigationSteps[i];
      const distance = calculateDistance(
        currentLocation,
        step.location
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestStepIndex = i;
      }

      // If we're very close to a step (within 50 meters), move to next step
      if (distance < 0.05 && i > currentStep) {
        setCurrentStep(i);
        break;
      }
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const startLocationTracking = async () => {
    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for navigation');
        return;
      }

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(initialLocation);

      // Start watching location changes
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(newLocation);
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Location Error', 'Unable to get your location');
    }
  };

  const fetchDirections = async (origin, destination) => {
    try {
      // Call your backend API for real directions
      const response = await fetch(
        `${config.API_BASE_URL}/directions?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Update route and navigation data
        if (data.route && data.route.length > 0) {
          setRoute(data.route);
          setNavigationSteps(data.steps || []);
          setRouteInfo({
            distance: data.distance || 'Unknown',
            duration: data.duration || 'Unknown'
          });
        }
      } else {
        // Fallback to straight line if API fails
        setRoute([origin, destination]);
        setNavigationSteps([{
          instruction: "Navigate to destination",
          distance: "Unknown",
          duration: "Unknown",
          location: destination
        }]);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      // Fallback to straight line
      setRoute([origin, destination]);
      setNavigationSteps([{
        instruction: "Navigate to destination",
        distance: "Unknown",
        duration: "Unknown",
        location: destination
      }]);
    }
  };

  const startNavigation = () => {
    setIsNavigating(true);
    setCurrentStep(0);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentStep(0);
  };

  return (
    <SafeAreaView style={styles.fullscreenContainer}>
      <MapView
        ref={mapRef}
        style={styles.fullscreenMap}
        initialRegion={{
          latitude: destination.latitude,
          longitude: destination.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        followsUserLocation={true}
        showsTraffic={true}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Your Location"
          >
            <View style={styles.currentLocationMarker} />
          </Marker>
        )}

        {/* Destination Marker */}
        <Marker
          coordinate={destination}
          title={hospitalDetails?.name || "Destination"}
        >
          <View style={styles.hospitalMarker}>
            <Text style={styles.markerText}>H</Text>
          </View>
        </Marker>

        {/* Route Polyline */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeColor={isNavigating ? "#00AA00" : "#007AFF"}
            strokeWidth={6}
          />
        )}
      </MapView>

      {/* Top Header with Navigation */}
      <View style={styles.topHeader}>
        <Button
          title="← Back"
          variant="primary"
          size="small"
          onPress={onBackPress}
          style={styles.backButton}
        />
      </View>

      {/* Hospital Info Card */}
      {hospitalDetails && (
        <View style={styles.hospitalInfoCard}>
          <Text style={styles.hospitalCardName}>{hospitalDetails.name}</Text>
          <Text style={styles.hospitalCardAddress}>Address: {hospitalDetails.formatted_address}</Text>
          <Text style={styles.hospitalCardPhone}>Phone: {hospitalDetails.formatted_phone_number || 'N/A'}</Text>
          {routeInfo.distance && (
            <Text style={styles.hospitalCardRoute}>
              {routeInfo.distance} • {routeInfo.duration}
            </Text>
          )}
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Current Navigation Instruction */}
        {isNavigating && navigationSteps.length > 0 && currentStep < navigationSteps.length ? (
          <View style={styles.currentInstructionContainer}>
            <Text style={styles.currentInstructionText}>
              {navigationSteps[currentStep].instruction}
            </Text>
            <Text style={styles.currentStepInfo}>
              In {navigationSteps[currentStep].distance} • Step {currentStep + 1} of {navigationSteps.length}
            </Text>
          </View>
        ) : (
          <View style={styles.currentInstructionContainer}>
            <Text style={styles.currentInstructionText}>
              Tap "Start Navigation" to begin turn-by-turn directions
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="View All Steps"
            variant="primary"
            size="medium"
            onPress={() => setShowDirectionsList(true)}
            style={styles.directionsListButton}
          />

          <Button
            title={isNavigating ? "Stop Navigation" : "Start Navigation"}
            variant="primary"
            size="medium"
            onPress={isNavigating ? stopNavigation : startNavigation}
            style={[styles.navigationActionButton, isNavigating && styles.activeNavigationButton]}
            textStyle={isNavigating && styles.activeNavigationButtonText}
          />
        </View>
      </View>

      {/* Directions List Modal */}
      <Modal
        visible={showDirectionsList}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Turn-by-Turn Directions</Text>
            <TouchableOpacity onPress={() => setShowDirectionsList(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.directionsScrollView}>
            {directions.map((step, index) => (
              <View key={index} style={styles.directionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepInstruction}>
                    {step.instruction.replace(/<[^>]+>/g, '')}
                  </Text>
                  <Text style={styles.stepDistance}>
                    {step.distance} • {step.duration}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#fff', // Changed from #000 to match rounding
    padding: 10, // Added padding for rounded effect
  },
  fullscreenMap: {
    width: '100%',
    height: '100%',
    borderRadius: 20, // Added for rounded corners
  },
  
  // Custom Markers
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 3,
    borderColor: 'white',
  },
  hospitalMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D32F2F', // Changed color for hospital
  },
  markerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },

  // Top Header
  topHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Hospital Info Card
  hospitalInfoCard: {
    position: 'absolute',
    top: 120, // Same distance from top as buttons + some spacing
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  hospitalCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  hospitalCardAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  hospitalCardPhone: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  hospitalCardRoute: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  currentInstructionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  currentInstructionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  currentStepInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  directionsListButton: {
    flex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navigationActionButton: {
    flex: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeNavigationButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  activeNavigationButtonText: {
    color: '#000',
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  directionsScrollView: {
    flex: 1,
  },
  directionStep: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 5,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    lineHeight: 22,
  },
  stepDistance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
});

export default MapComponent;
