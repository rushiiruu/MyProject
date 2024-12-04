import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    // Navigate to the login screen
    navigation.navigate('LogSign');
  };

  return (
    <View style={styles.container}>
      {/* Logo - replace with your actual logo import */}
      <Image 
        source={require('../src/assets/Splash.png')}
        style={styles.logo} 
        resizeMode="contain"
      />

      {/* Get Started Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('LogSign')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6d8a', // Light pink background
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 300, // Adjust based on your logo size
    height: 350, // Adjust based on your logo size
    marginBottom: 50,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#E34766', // Matching pink text
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SplashScreen;