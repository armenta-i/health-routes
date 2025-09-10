import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import config from '../config';
import Button from '../components/Button';

const screenWidth = Dimensions.get('window').width;

const languages = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Vietnamese',
  'Tagalog',
  'Polish',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Other'
];

export default function MedicalForm({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('basic');
  const [location, setLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [language, setLanguage] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');
  const [howAreYou, setHowAreYou] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const selectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      // Request permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find nearby healthcare providers automatically.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        setLocationLoading(false);
        return;
      }

      // Get current position
      let currentPosition = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentPosition.coords;
      setCurrentLocation({ latitude, longitude });

      // Reverse geocode to get address
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formattedAddress = `${address.street || ''} ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim();
        setLocation(formattedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } else {
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please enter your location manually.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    // Automatically get location when component mounts
    getCurrentLocation();
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (!location.trim() || !language.trim() || !medicalIssue.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Submitting medical form...');
      console.log('API URL:', `${config.API_BASE_URL}/medicalpost`);
      
      const response = await fetch(`${config.API_BASE_URL}/medicalpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
          language: language,
          medical_issue: medicalIssue,
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        // Navigate to results screen with the API response
        navigation.navigate('resultsScreen', {
          location,
          language,
          medical_issue: medicalIssue,
          how_are_you: howAreYou,
          gemini_response: data.message // Pass the Gemini response
        });
      } else {
        Alert.alert('Error', 'Failed to get medical advice. Please try again.');
      }
    } catch (err) {
      console.error('Medical form submission error:', err);
      Alert.alert('Network error', 'Please check your connection and try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.logo}>♡ Health-Routes</Text>
        <Button
          title="Home"
          variant="primary"
          size="small"
          onPress={() => navigation.navigate('LandingPage')}
          style={styles.homeButton}
        />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Healthcare Needs</Text>
        <Text style={styles.subtitle}>
          Fill out this form to help us find the best healthcare options for you.
        </Text>

        {/* Basic Info Section */}
        {selectedTab === 'basic' && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Your Current Location</Text>
            <View style={styles.locationDisplayContainer}>
              <View style={styles.locationDisplay}>
                {locationLoading ? (
                  <View style={styles.locationLoadingContainer}>
                    <ActivityIndicator size="small" color="#666" />
                    <Text style={styles.locationLoadingText}>Getting your location...</Text>
                  </View>
                ) : (
                  <Text style={styles.locationText}>
                     {location || "Location not detected"}
                  </Text>
                )}
              </View>
              <Button
                title="Refresh"
                variant="secondary"
                size="small"
                onPress={getCurrentLocation}
                loading={locationLoading}
                style={styles.refreshLocationButton}
              />
            </View>
            <Text style={styles.helperText}>
              {locationLoading 
                ? "Detecting your current location automatically..."
                : "We automatically detected your location to find nearby healthcare options."
              }
            </Text>

            <Text style={styles.label}>Preferred Language</Text>
            <TouchableOpacity 
              style={styles.dropdown}
              onPress={() => setShowLanguageModal(true)}
            >
              <Text style={[styles.dropdownText, !language && styles.placeholderText]}>
                {language || 'Select your preferred language'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.helperText}>
              We'll try to match you with providers who speak your language.
            </Text>

            <Text style={styles.label}>Type of Care Needed</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the type of care you need"
              multiline={true}
              value={medicalIssue}
              onChangeText={setMedicalIssue}
            />
            <Text style={styles.helperText}>
              This helps us find the right type of healthcare provider for you.
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <Button
          title="Get Medical Advice"
          variant="primary"
          size="large"
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={languages}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  language === item && styles.selectedLanguageOption
                ]}
                onPress={() => selectLanguage(item)}
              >
                <Text style={[
                  styles.languageOptionText,
                  language === item && styles.selectedLanguageText
                ]}>
                  {item}
                </Text>
                {language === item && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

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
  homeButton: {
    borderRadius: 8,
  },
  container: {
    padding: 24,
    paddingBottom: 40
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24
  },
  formSection: {
    marginBottom: 50
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 16
  },
  locationDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationDisplay: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    minHeight: 44,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationLoadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  refreshLocationButton: {
    minWidth: 70,
    paddingHorizontal: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 140,
    marginBottom: 16
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
    flex: 1
  },
  placeholderText: {
    color: '#999'
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16
  },
  submitButton: {
    marginTop: 20,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
    padding: 5,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageOption: {
    backgroundColor: '#f8f9fa',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLanguageText: {
    color: '#000',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});