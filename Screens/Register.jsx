import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {colors} from './src/utils/colors';

const App = () => {
  return (
    <View style={styles.container}>
      {/* Logo in the top-left */}
      <View style={styles.logoContainer}>
        <Image source={require('./src/assets/logo.png')} style={styles.logo} />
      </View>

      {/* Reg image and text in the center */}
      <View style={styles.centerContent}>
        <Image
          source={require('./src/assets/reg.png')}
          style={styles.bannerImage}
        />
        <Text style={styles.title}>Welcome to Cura!</Text>
        <Text style={styles.subtitle}>
          Empowering your health journey—please select an option to continue:
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.loginButtonWrapper,
              {backgroundColor: colors.primary},
            ]}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.loginButtonWrapper]}>
            <Text style={styles.signButtonText}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
  },
  logo: {
    height: 40,
    width: 110,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'flex-start', // Aligns items to the start
    alignItems: 'center', // Centers horizontally
    marginTop: 120, // Adjust this value to lower the reg image
  },
  bannerImage: {
    height: 340,
    width: 261,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginTop: 0,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    paddingHorizontal: 20, // Add horizontal padding for space on both sides
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    width: '80%',
    height: 60,
    borderRadius: 100,
  },
  loginButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    borderRadius: 98,
  },
  loginButtonText: {
    fontSize: 18,
    color: colors.white,
    fontFamily: 'Poppins-Medium',
  },
  signButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
});
