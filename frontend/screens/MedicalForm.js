import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
export default function MedicalForm() {
  const [selectedTab, setSelectedTab] = useState('basic');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('');
  const [careType, setCareType] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
        {/* Form Title */}
        <Text style={styles.title}>Your Healthcare Needs</Text>
        <Text style={styles.subtitle}>
            Fill out this form to help us find the best healthcare options for you.
        </Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
            <TouchableOpacity
            style={[
                styles.tabButton,
                selectedTab === 'basic' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('basic')}
            >
            <Text style={selectedTab === 'basic' ? styles.tabTextActive : styles.tabText}>Basic Information</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={[
                styles.tabButton,
                selectedTab === 'additional' && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab('additional')}
            >
            <Text style={selectedTab === 'additional' ? styles.tabTextActive : styles.tabText}>Additional Details</Text>
            </TouchableOpacity>
        </View>

        {/* Form Fields (only show basic for now) */}
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
            <Text style={styles.helperText}>
                We'll use this to find healthcare options near you.
            </Text>

            {/* Preferred Language */}
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

            {/* Type of Care Needed */}
            <Text style={styles.label}>Type of Care Needed</Text>
            <TextInput
                style={styles.input}
                placeholder="Select the type of care you need"
                value={careType}
                onChangeText={setCareType}
            />
            <Text style={styles.helperText}>
                This helps us find the right type of healthcare provider for you.
            </Text>
            </View>
        )}

        {/* Find Care Button */}
        <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Find Care Options</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
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
