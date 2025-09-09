import React, { useState } from 'react';
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
import config from '../config';

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
  const [language, setLanguage] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');
  const [howAreYou, setHowAreYou] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const selectLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    setShowLanguageModal(false);
  };

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
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('LandingPage')} // <-- Update 'LandingPage' to your landing page route
        >
          <Text style={styles.homeButtonText}>Home</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Healthcare Needs</Text>
        <Text style={styles.subtitle}>
          Fill out this form to help us find the best healthcare options for you.
        </Text>

        {/* Basic Info Section */}
        {selectedTab === 'basic' && (
          <View style={styles.formSection}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city, zip code, or address"
              value={location}
              onChangeText={setLocation}
            />
            <Text style={styles.helperText}>
              We'll use this to find healthcare options near you.
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
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.submitButtonText}>Getting Medical Advice...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Get Medical Advice</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: 'black',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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