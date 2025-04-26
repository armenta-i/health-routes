import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="LandingPage" component={LandingPage} />
      <MainStack.Screen name="MedicalForm" component={MedicalForm} />
    </MainStack.Navigator>
  );
}

// Root navigator that handles switching between auth and main flows
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Auth">
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Main" component={MainNavigator} options={{ gestureEnabled: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}