/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import Icon from 'react-native-vector-icons/Ionicons';
import {View} from 'react-native';

import HomeScreen from './Screens/HomeScreen';
import ScanScreen from './Screens/ScanScreen';
import ProfileScreen from './Screens/ProfileScreen';
import HistoryScreen from './Screens/HistoryScreen'; // Changed this import
import FindScreen from './Screens/FindScreen';
import MedicineDetailsScreen from './Screens/MedicineDetailsScreen';

// Enable screens for better performance
enableScreens();

const TabNav = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MedicineDetailsScreen"
        component={MedicineDetailsScreen}
        options={{headerTitle: 'Medicine Details'}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function FindStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Find"
        component={FindScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MedicineDetailsScreen"
        component={MedicineDetailsScreen}
        options={{headerTitle: 'Medicine Details'}}
      />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
    </Stack.Navigator>
  );
}

function FavoritesStack(){
  return (
    <Stack.Navigator >
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{headerShown: false}} 
      />
      <Stack.Screen
        name="MedicineDetailsScreen"
        component={MedicineDetailsScreen}
        options={{headerTitle: 'Medicine Details'}}
      />
    </Stack.Navigator>
  );
}




export default function Tab() {
  const [isScanSelected, setIsScanSelected] = useState(false);

  return (
    <TabNav.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D8385E',
        tabBarInactiveTintColor: '#D8385E',
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          height: 60,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 5},
          shadowOpacity: 0.3,
          shadowRadius: 5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 16,
        },
      }}>
      <TabNav.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'home' : 'home-outline'}
                size={25}
                color={focused ? '#D8385E' : 'rgba(216, 56, 94, 0.5)'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        listeners={({navigation}) => ({
          focus: () => setIsScanSelected(false),
          tabPress: () => {
            // Navigate to the initial route of the stack
            navigation.navigate('HomeScreen');
          },
        })}
      />


      <TabNav.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                top: isScanSelected ? -20 : 0, // Adjust position based on state
                width: isScanSelected ? 50 : 50,
                height: isScanSelected ? 50 : 50,
                borderRadius: 30,
                backgroundColor: isScanSelected ? '#D8385E' : 'transparent',
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: isScanSelected ? 0.25 : 0,
                shadowRadius: isScanSelected ? 4 : 0,
                opacity: isScanSelected ? 1 : 0.5, // Lower opacity when not selected
              }}>
              <Icon
                name="scan-circle-sharp"
                size={30}
                color={isScanSelected ? 'white' : '#D8385E'}
              />
            </View>
          ),
        }}
        listeners={({navigation}) => ({
          focus: () => setIsScanSelected(true),
          blur: () => setIsScanSelected(false),
          tabPress: () => {
            navigation.navigate('Scan'); // Ensure the name matches your registered screen
          },
        })}
      />

      <TabNav.Screen
        name="Favorites" // Updated tab name to Favorites
        component={FavoritesStack} // Still uses HistoryScreen as the component
        options={{
          headerShown: false,
          tabBarIcon: ({focused}) => (
            <View style={{alignItems: 'center'}}>
              <Icon
                name={focused ? 'heart' : 'heart-outline'} // Updated icon to heart
                size={30}
                color={focused ? '#D8385E' : 'rgba(216, 56, 94, 0.5)'}
              />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
        //listeners={{
          //focus: () => setIsScanSelected(false),
        //}}
        listeners={({navigation}) => ({
          focus: () => setIsScanSelected(false),
          tabPress: () => {
            // Navigate to the initial route of the stack
            navigation.navigate('HistoryScreen');
          },
        })}
      />
    </TabNav.Navigator>
  );
}

const styles = {
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#D8385E',
    marginTop: 5,
  },
};
