import React, { useState, useEffect } from 'react';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import SplashScreen from './Screens/SplashScreen';
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

const Stack = createNativeStackNavigator();

function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        // If no user is logged in, redirect to Splash screen
        setIsAuthenticated(false);
        setIsFirstLaunch(true);
      } else {
        // If a user is logged in, navigate to the Tabs screen
        setIsAuthenticated(true);
        setIsFirstLaunch(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleAuthSuccess = (navigation) => {
    setIsAuthenticated(true);
    setIsFirstLaunch(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Tabs' }],
    });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={isFirstLaunch ? 'Splash' : isAuthenticated ? 'Tabs' : 'LogSign'}>
        {isFirstLaunch && <Stack.Screen name="Splash" component={SplashScreen} />}
        <Stack.Screen name="LogSign">
          {props => (
            <LogSign
              {...props}
              onAuthSuccess={(navigation) => handleAuthSuccess(props.navigation)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Tabs" component={Tabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppRegistry.registerComponent('MyProject', () => App);

export default App;
