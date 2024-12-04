import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null); // Manage user state
  const auth = getAuth();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user data based on authentication state
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Logged Out', 'You have been logged out successfully');
        navigation.replace('LogSign'); // Redirect to login screen after logout
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
      {user ? (
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.displayName || 'N/A'}</Text>
          <View style={styles.usernameLine} />

          <Text style={styles.label}>EMAIL</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={[styles.label, styles.additionalSpacing]}>PASSWORD</Text>
          <Text style={styles.value}>********</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.noUserText}>No user logged in</Text>
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
    width: '100%',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  usernameLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 35,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 10,
    textAlign: 'left',
  },
  value: {
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
    paddingBottom: 5,
    width: '100%',
    textAlign: 'left',
  },
  additionalSpacing: {
    marginTop: 30,
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
  noUserText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;
