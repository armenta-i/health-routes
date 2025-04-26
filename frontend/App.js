import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import landingPage from './screens/landingPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={landingPage} 
          options={{ headerShown: false }} // hide top nav bar if you want
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
