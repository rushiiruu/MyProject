import React, {useState, useEffect} from 'react';
import {AppRegistry} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import LogSign from './Screens/LogSign';
import Tabs from './Tabs';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAThG22WNthHCGtQ7Uh_9mkAA9LZyAcvc8',
  authDomain: 'cura-3fad8.firebaseapp.com',
  projectId: 'cura-3fad8',
  storageBucket: 'cura-3fad8.appspot.com',
  messagingSenderId: '1067253472113',
  appId: '1:1067253472113:web:230336e1702e4a8bc774d0',
};

// Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

const Stack = createNativeStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return null; // You could add a loading spinner here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name="LogSign">
            {props => <LogSign {...props} onAuthSuccess={handleAuthSuccess} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Tabs" component={Tabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('MyProject', () => App);

export default App;
