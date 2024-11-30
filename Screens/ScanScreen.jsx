import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as Papa from 'papaparse';
import RNFS from 'react-native-fs';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {PermissionsAndroid} from 'react-native';


const ScanScreen = ({navigation}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [responseText, setResponseText] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [extractedTokens, setExtractedTokens] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  // Load CSV File
  const loadCSV = async () => {
    try {
      const csvContent = await RNFS.readFileAssets('Medicine_Info.csv', 'utf8');
      Papa.parse(csvContent, {
        header: true,
        complete: result => {
          setCsvData(result.data);
        },
        error: error => {
          console.error('CSV Load Error:', error);
        },
      });
    } catch (error) {
      console.error('Error loading CSV:', error);
    }
  };

  useEffect(() => {
    loadCSV();
  }, []);

  // Permission Requests
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to scan medicines.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Gallery Permission',
          message: 'App needs access to your gallery to select images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Function to tokenize text into individual words
  const tokenizeText = text => {
    const tokens = text
      .split(/[\s,.-]+/)
      .filter(token => token.length > 2)
      .map(token => token.trim().toLowerCase());

    return [...new Set(tokens)];
  };

  // Process image and extract text
  const processImage = async imageData => {
    try {
      setScanning(true);
      const formData = new FormData();
      formData.append('image', {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'medicine.jpg',
      });

      const response = await axios.post(
        `https://rusyl.pythonanywhere.com/process-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.tokens) {
        setResponseText(response.data.raw_text); // Set the raw text response
        const tokens = response.data.tokens; // Extract tokens from the response
        setExtractedTokens(tokens); // Set tokens to the state
        searchCsvWithTokens(tokens); // Search CSV with extracted tokens
      } else {
        Alert.alert(
          'No Tokens Found',
          'No tokens could be extracted from the image.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process the image. Please try again.');
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  // Launch Camera
  const launchCameraWithPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        const options = {
          mediaType: 'photo',
          quality: 1,
          saveToPhotos: false,
          cameraType: 'back',
        };

        const response = await launchCamera(options);
        if (!response.didCancel && response.assets && response.assets[0]) {
          setImageUri(response.assets[0].uri);
          await processImage(response.assets[0]);
        }
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan medicines',
          [
            {
              text: 'OK',
              onPress: () => requestCameraPermission(),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access camera: ' + error.message);
    }
  };

  // Launch Gallery
  const pickImageWithPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        const options = {
          mediaType: 'photo',
          quality: 1,
        };

        const response = await launchImageLibrary(options);
        if (!response.didCancel && response.assets && response.assets[0]) {
          setImageUri(response.assets[0].uri);
          await processImage(response.assets[0]);
        }
      } else {
        Alert.alert(
          'Gallery Permission Required',
          'Please grant gallery access to select images',
          [
            {
              text: 'OK',
              onPress: () => requestGalleryPermission(),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access gallery: ' + error.message);
    }
  };

  // Search CSV Data with Extracted Tokens
  const searchCsvWithTokens = tokens => {
    if (!tokens.length) return;

    const searchResults = csvData.filter(item => {
      const medicineName = item['Medicine Name']?.toLowerCase() || '';

      return tokens.some(token => {
        return (
          medicineName.includes(` ${token} `) ||
          medicineName.startsWith(`${token} `) ||
          medicineName.endsWith(` ${token}`) ||
          medicineName === token
        );
      });
    });

    setFilteredData(searchResults);
  };

  const renderItem = ({item}) => {
    const medicineName = item['Medicine Name'].toLowerCase();
    const matchedTokens = extractedTokens.filter(
      token =>
        medicineName.includes(` ${token} `) ||
        medicineName.startsWith(`${token} `) ||
        medicineName.endsWith(` ${token}`) ||
        medicineName === token,
    );

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          // Navigate to MedicineDetailsScreen and pass the medicine data
          navigation.navigate('MedicineDetailsScreen', {medicine: item});
        }}>
        <Text style={styles.medicineName}>{item['Medicine Name']}</Text>
        <Text style={styles.uses}>{item['Uses']}</Text>
        <Text style={styles.matchInfo}>
          Matched terms: {matchedTokens.join(', ')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={launchCameraWithPermission}>
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={pickImageWithPermission}>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{uri: imageUri}} style={styles.previewImage} />
        </View>
      )}

      {scanning ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageContainer: {
    marginVertical: 20,
  },
  previewImage: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  uses: {
    fontSize: 14,
    color: '#555',
  },
  matchInfo: {
    fontSize: 12,
    color: '#888',
  },
});

export default ScanScreen;
