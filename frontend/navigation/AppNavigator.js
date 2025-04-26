import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingPage from '../screens/LandingPage';
import MedicalForm from '../screens/MedicalForm';
import CreateUser from '../screens/CreateUser';
import Login from '../screens/Login';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CreateUser" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CreateUser" component={CreateUser} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="MedicalForm" component={MedicalForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
