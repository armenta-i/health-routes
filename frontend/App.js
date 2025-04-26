import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // <-- only NavigationContainer here
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // <-- Stack here

// Import your screens
import CreateUser from './screens/CreateUser';
import Login from './screens/Login';
// import Landing from './screens/Landing';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name='CreateUser' component={CreateUser}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
