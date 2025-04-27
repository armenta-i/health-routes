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
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function MedicalForm({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('basic');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');
  const [howAreYou, setHowAreYou] = useState(''); // <-- Added missing state if needed

  const handleSubmit = async () => {
    try {
      navigation.navigate('resultsScreen', {
        location,
        language,
        medical_issue: medicalIssue,
        how_are_you: howAreYou
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Network error', 'Please try again');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            <TextInput
              style={styles.input}
              placeholder="Select your preferred language"
              value={language}
              onChangeText={setLanguage}
            />
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Find Care Options</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center'
  },
  tabButtonActive: {
    backgroundColor: '#fff'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  tabTextActive: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold'
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
});
