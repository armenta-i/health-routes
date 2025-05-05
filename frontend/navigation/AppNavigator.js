import React, { useState, useEffect, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create navigation stacks
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

// Screens
import LandingPage from '../screens/LandingPage';
import MedicalForm from '../screens/MedicalForm';
import CreateUser from '../screens/CreateUser';
import Login from '../screens/Login';
import ResultsScreen from '../screens/resultsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Create and export AuthContext
export const AuthContext = createContext();

// Auth Navigator component
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    <AuthStack.Screen name="Login" component={Login} />
    <AuthStack.Screen name="CreateUser" component={CreateUser} />
  </AuthStack.Navigator>
);

// Main Navigator component
const MainNavigator = () => (
  <MainStack.Navigator screenOptions={{ headerShown: false }}>
    <MainStack.Screen name="Landing" component={LandingPage} />
    <MainStack.Screen name="MedicalForm" component={MedicalForm} />
    <MainStack.Screen name="Results" component={ResultsScreen} />
  </MainStack.Navigator>
);

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

  return (
    <AuthContext.Provider value={{ userToken, setUserToken }}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {userToken ? (
            <RootStack.Screen name="Main" component={MainNavigator} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}