import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import {getAuth, signOut} from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({navigation}) => {
  const auth = getAuth();
  const user = auth.currentUser; // Get current user details

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Logged Out', 'You have been logged out successfully');
        navigation.replace('Login'); // Redirect to login or home screen after logout
      })
      .catch(error => {
        console.error('Logout error:', error);
        Alert.alert('Error', 'An error occurred while logging out');
      });
  };

  return (
    <View style={styles.container}>
      {/* Back Icon */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('HomeScreen')}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Profile Header */}
      <Text style={styles.title}>Profile</Text>

      {/* Display user information */}
      {user && (
        <View style={styles.infoContainer}>
          {/* Centered Username */}
          <Text style={styles.name}>{user.displayName || 'N/A'}</Text>

          {/* Line Under Username */}
          <View style={styles.usernameLine} />

          {/* Left-aligned email and password */}
          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.value}>{user.email}</Text>

          {/* Increased space between email and password */}
          <Text style={[styles.label, styles.additionalSpacing]}>PASSWORD</Text>
          <Text style={styles.value}>********</Text>

          {/* Log Out Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    left: 30,
    color: '#333',
  },
  infoContainer: {
    marginTop: 230,
    width: '100%', // Ensure full width
    paddingHorizontal: 20, // Add padding for left margin
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10, // Reduced margin bottom for less space between name and line
    textAlign: 'center', // Center align the username text
  },
  usernameLine: {
    // UserName Line
    width: '80%', // Line width
    height: 1, // Thickness of the line
    backgroundColor: '#DDD', // Line color
    alignSelf: 'center', // Center the line under the username
    marginBottom: 35, // Space between line and email section
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 10,
    textAlign: 'left', // Align text to the left
  },
  value: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 5,
    width: '100%', // Full width
    textAlign: 'left', // Align text to the left
  },
  additionalSpacing: {
    marginTop: 30, // Increased space between email and password
  },
  editButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: '#FF4D6D',
    borderRadius: 25,
  },
  editButtonText: {
    color: '#FF4D6D',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    top: 245,
    alignSelf: 'center',
    backgroundColor: '#FF4D6D',
    paddingVertical: 12,
    paddingHorizontal: 120,
    borderRadius: 25,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
