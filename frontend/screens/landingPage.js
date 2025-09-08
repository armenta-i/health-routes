import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Logout } from './Logout';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';



const screenWidth = Dimensions.get('window').width;

export default function LandingPage({navigation}) {
  const { setUserToken } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1 }}>

    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>♡ Health-Routes</Text>
        <View style={styles.navButtons}>
          <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('MedicalForm')}
          >
            <Text style={styles.navButtonText}>Find Care</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
              style={[styles.navButton, { marginLeft: 10 }]} 
              onPress={() => Logout(setUserToken)}
            >
              <Text style={styles.navButtonText}>Logout</Text> 
            </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroHeadline}>
            Connecting You to the Best Healthcare Options
          </Text>
          <Text style={styles.heroSubtext}>
            Health-Routes helps patients in rural, tribal, and border communities find
            healthcare that fits their needs, language, and location.
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity style={styles.primaryButton}
              onPress={() => navigation.navigate('MedicalForm')}>
              <Text style={styles.primaryButtonText}>Find Care Now →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* <View style={styles.heroImageBlock}>
          <Image
            source={{ uri: 'https://via.placeholder.com/300x200.png?text=Image' }}
            style={styles.heroImage}
            />
        </View> */}
      </View>

      {/* How Fidari Works */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.howItWorksTitle}>How Health-Routes Works</Text>
        <Text style={styles.howItWorksSubtitle}>
          Our platform connects you to healthcare options that match your needs, language, and location.
        </Text>

        <View style={styles.stepsContainer}>
          {/* Step 1 */}
          <View style={styles.stepBlock}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Tell Us Your Needs</Text>
            <Text style={styles.stepDescription}>
              Share your location, language preference, and healthcare needs.
            </Text>
          </View>

          {/* Step 2 */}
          <View style={styles.stepBlock}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={styles.stepTitle}>We Find Matches</Text>
            <Text style={styles.stepDescription}>
              Our AI analyzes your situation and finds the best healthcare options for you.
            </Text>
          </View>

          {/* Step 3 */}
          <View style={styles.stepBlock}>
            <View style={styles.stepNumberCircle}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Get Connected</Text>
            <Text style={styles.stepDescription}>
              Receive personalized care options via web or SMS with directions and contact information.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLink: {
    marginRight: 15,
    fontSize: 14,
    color: 'black',
  },
  navButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: screenWidth > 768 ? 'row' : 'column', // if small screen, stack vertically
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 24,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 300,
  },
  heroHeadline: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  heroSubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
    marginRight: 12,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 6,
    marginBottom: 8,
  },
  secondaryButtonText: {
    color: 'black',
  },
  heroImageBlock: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#eee',
  },
  howItWorksSection: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  howItWorksTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  howItWorksSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
  },
  stepsContainer: {
    width: '100%',
    flexDirection: screenWidth > 768 ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 24,
  },
  stepBlock: {
    width: screenWidth > 768 ? '30%' : '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepNumberCircle: {
    backgroundColor: 'black',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 280,
  },
});
