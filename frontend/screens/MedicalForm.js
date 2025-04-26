import { useState } from 'react';
import {
  View, Text, TextInput,
  TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView,
  Alert
} from 'react-native';

export default function MedicalForm() {
  const [selectedTab, setSelectedTab] = useState('basic');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  const [medicalIssue, setMedicalIssue] = useState('');

  const handleSubmit = async () => {
    
    const payload = {
      location: location,
      language: language,
      medicalIssue: medicalIssue,   
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Form submitted!');
        console.log('Backend response:', json);
      } else {
        Alert.alert('Error', json.detail || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network error', 'Please try again');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/*tabs*/}
        {selectedTab === 'basic' && (
          <View style={styles.formSection}>
            {/* Location */}
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your city, zip code, or address"
              value={location}
              onChangeText={setLocation}
            />
            {/* Language */}
            <Text style={styles.label}>Preferred Language</Text>
            <TextInput
              style={styles.input}
              placeholder="Select your preferred language"
              value={language}
              onChangeText={setLanguage}
            />
            {/*medicalIssues*/}
            <Text style={styles.label}>Type of Care Needed</Text>
            <TextInput
              style={styles.input}
              placeholder="How can we help you today"
              value={medicalIssue}
              onChangeText={medicalIssue}
            />
          </View>
        )}

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Find Care Options</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* …style */
  submitButton: {
    backgroundColor: 'black',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});