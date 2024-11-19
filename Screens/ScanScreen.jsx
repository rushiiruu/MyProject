import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000'; // Update to the actual IP if using a physical device

const ScanScreen = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [responseText, setResponseText] = useState('');

  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter a valid URL.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/process-image`, {
        image: imageUrl, // Ensure the key matches what your Flask app expects
      });

      if (response.data.text) {
        setResponseText(response.data.text); // Extracted text from the Flask app
      } else if (response.data.error) {
        Alert.alert('Error', response.data.error); // Show error from Flask app
      } else {
        Alert.alert('No Text Found', 'The image did not contain any text.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Image URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter image URL here"
        value={imageUrl}
        onChangeText={setImageUrl}
      />
      <TouchableOpacity style={styles.button} onPress={handleUrlSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {responseText ? (
        <View style={styles.responseContainer}>
          <Text style={styles.responseText}>Extracted Text:</Text>
          <Text style={styles.responseContent}>{responseText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  responseText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  responseContent: {
    fontSize: 16,
    color: '#333',
  },
});

export default ScanScreen;
