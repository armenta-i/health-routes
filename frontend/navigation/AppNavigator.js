import React, { useState, useEffect, createContext } from 'react';
import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingPage from '../screens/LandingPage';
import MedicalForm from '../screens/MedicalForm';
import CreateUser from '../screens/CreateUser';
import Login from '../screens/Login';
import ResultsScreen from '../screens/resultsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        setUserToken(isLoggedIn === 'true' ? true : null);
      } catch (e) {
        console.log('Failed to load auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null;
  }

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        setUserToken(isLoggedIn === 'true' ? true : null);
      } catch (e) {
        console.log('Failed to load auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ResultsScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CreateUser" component={CreateUser} />
        <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="MedicalForm" component={MedicalForm} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen}/>      
      </Stack.Navigator>
    </NavigationContainer>
  );
}
