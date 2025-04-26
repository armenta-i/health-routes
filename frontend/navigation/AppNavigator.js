import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LandingPage from '../screens/LandingPage';
import MedicalForm from '../screens/MedicalForm';
import CreateUser from '../screens/CreateUser';
import Login from '../screens/Login';
import OnboardingScreen from '../screens/OnboardingScreen';

// Create separate stacks for authentication and main app
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Auth navigator for login/registration screens
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="CreateUser" component={CreateUser} />
    </AuthStack.Navigator>
  );
}

// Main app navigator for authenticated screens
function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LandingPage">
      <MainStack.Screen name="LandingPage" component={LandingPage} />
      <MainStack.Screen name="MedicalForm" component={MedicalForm} />
    </MainStack.Navigator>
  );
}

// Root navigator that handles switching between auth and main flows
export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    // Check for existing login session
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
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          // User is logged in
          <RootStack.Screen 
            name="Main" 
            component={MainNavigator} 
            options={{ gestureEnabled: false }} 
          />
        ) : (
          // User is not logged in
          <RootStack.Screen 
            name="Auth" 
            component={AuthNavigator} 
            options={{ gestureEnabled: false }} 
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}