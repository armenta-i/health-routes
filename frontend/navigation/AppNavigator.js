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
import OnboardingScreen from '../screens/OnboardingScreen';
import resultsScreen from '../screens/resultsScreen'; // <--- Import it at the top

// Context
export const AuthContext = createContext();

// Make Stack Navigators
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Define Navigators BEFORE AppNavigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="CreateUser" component={CreateUser} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LandingPage">
      <MainStack.Screen name="LandingPage" component={LandingPage} />
      <MainStack.Screen name="MedicalForm" component={MedicalForm} />
      <MainStack.Screen name="resultsScreen" component={resultsScreen} />
      </MainStack.Navigator>
  );
}

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