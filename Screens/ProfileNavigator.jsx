import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import ProfileScreen from './Screens/ProfileScreen'; // Your Profile screen

const ProfileStack = createStackNavigator();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}} // Optional: Hide header if not needed
      />
    </ProfileStack.Navigator>
  );
}

export default ProfileNavigator;
