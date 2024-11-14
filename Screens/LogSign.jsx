import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const LogSign = ({onAuthSuccess}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const auth = getAuth();

  const handleAuth = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (isSignUp && (!email || !password || !username)) {
      setGeneralError('Please fill in all fields');
      return;
    }
    if (!isSignUp && (!email || !password)) {
      setGeneralError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        onAuthSuccess();
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        onAuthSuccess();
      }

      if (userCredential.user) {
        setEmail('');
        setPassword('');
        setUsername('');
      }
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setEmailError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setEmailError('Invalid email address');
          break;
        case 'auth/weak-password':
          setPasswordError('Password should be at least 6 characters');
          break;
        case 'auth/user-not-found':
          setEmailError('No user found with this email');
          break;
        case 'auth/wrong-password':
          setPasswordError('Incorrect password');
          break;
        default:
          setGeneralError('An error occurred');
      }
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setIsSignUp(!isSignUp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>
            {isSignUp ? 'Create Account' : 'Welcome Back!'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Sign up to get started' : 'Log in to your account'}
          </Text>

          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#999"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#999"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor="#999"
              />
            </View>
            {emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#999"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#999"
              />
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>

            {generalError ? (
              <Text style={styles.errorText}>{generalError}</Text>
            ) : null}

            <TouchableOpacity style={styles.switchButton} onPress={resetForm}>
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? 'Already have an account? '
                  : "Don't have an account? "}
                <Text style={styles.boldText}>
                  {isSignUp ? 'Login' : 'Sign Up'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF4D6D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFADC6',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#000',
    minHeight: 48,
  },
  button: {
    backgroundColor: '#FF4D6D',
    padding: 15,
    borderRadius: 20,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#999',
    fontSize: 14,
  },
  boldText: {
    color: '#FF4D6D',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 10,
  },
});

export default LogSign;
