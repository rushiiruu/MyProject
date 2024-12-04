import React, {useState, useEffect, useCallback} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';

const ScanScreen = ({navigation}) => {
  const [imageUrl, setImageUrl] = useState('');
  const [responseText, setResponseText] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [extractedTokens, setExtractedTokens] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [topMedicine, setTopMedicine] = useState(null);

  // Tokenize text function (updated to remove numeric tokens)
  const tokenizeText = text => {
    // List of common generic medicine terms to remove
    const genericTerms = [
      'capsule', 'capsules', 
      'tablet', 'tablets', 
      'pill', 'pills', 
      'medicine', 'medicinal',
      'drug', 'drugs',
      'syrup','inhaler','drops'
    ];
  
    const tokens = text
      .split(/[\s,.-]+/)
      .filter(token => !/\d/.test(token)) // Remove numeric tokens
      .map(token => token.trim().toLowerCase()) // Trim and convert to lowercase
      .filter(token => 
        token.length > 4 && // Keep tokens longer than 4 characters
        !genericTerms.includes(token) // Remove generic terms
      );
  
    return [...new Set(tokens)]; // Remove duplicates
  };

  // Find medicine with most matched tokens
  const findMedicineWithMostTokens = (data, tokens) => {
    if (!tokens.length) return null;

    const searchResults = data
      .map(item => {
        const medicineName = item['Medicine Name']?.toLowerCase() || '';
        const matchedTokens = tokens.filter(token =>
          medicineName.includes(token)
        );
        return {
          ...item,
          matchCount: matchedTokens.length,
          matchedTokens,
        };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    return searchResults[0]; // Return the medicine with the most tokens
  };

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

  // Reset screen state
  const resetScreen = () => {
    setImageUrl('');
    setResponseText('');
    setFilteredData([]);
    setExtractedTokens([]);
    setScanning(false);
    setImageUri(null);
    setTopMedicine(null);
  };

  // Use Focus Effect to reset screen when tab is clicked
  useFocusEffect(
    useCallback(() => {
      resetScreen();
    }, [])
  );

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
        `http://47.129.197.5:5000//process-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.data.tokens) {
        setResponseText(response.data.raw_text);
        const tokens = tokenizeText(response.data.raw_text);
        setExtractedTokens(tokens);
        searchCsvWithTokens(tokens);

        // Find and set the top medicine
        const topMatchedMedicine = findMedicineWithMostTokens(csvData, tokens);
        setTopMedicine(topMatchedMedicine);
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

    const searchResults = csvData
      .map(item => {
        const medicineName = item['Medicine Name']?.toLowerCase() || '';
        const matchedTokens = tokens.filter(token =>
          medicineName.includes(token)
        );
        return {
          ...item,
          matchCount: matchedTokens.length,
          matchedTokens,
        };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

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
          navigation.navigate('MedicineDetailsScreen', {medicine: item});
        }}>
        <Text style={styles.medicineName}>{item['Medicine Name']}</Text>
        <Text style={styles.uses}>{item['Uses']}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Conditionally render header and buttons only when no results are shown */}
      {filteredData.length === 0 && (
        <>
          {/* Header Section with Image Preview */}
          <View style={styles.headerContainer}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <Image
                source={require('../src/assets/ScanPreviewPlaceholder.png')}
                style={styles.previewImage}
              />
            )}
            <Text style={styles.scanText}>
              Scan or Upload-get the{' '}
              <Text style={styles.highlightedText}>info</Text> you need in a{' '}
              <Text style={styles.highlightedText}>snap</Text>!
            </Text>
          </View>

          {/* Button Container for Camera and Gallery */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={launchCameraWithPermission}>
              <Ionicons name="camera" size={20} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Use Camera{'\n'}To Scan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={pickImageWithPermission}>
              <Ionicons name="image" size={20} color="white" style={styles.icon} />
              <Text style={styles.buttonText}>Upload Image{'\n'}From Gallery</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Loading Indicator while Processing Image */}
      {scanning ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      ) : (
        <>
          {/* Top Medicine Highlight */}
          {topMedicine && (
            <View style={styles.topMedicineContainer}>
              <Text style={styles.topMedicineTitle}>Best Match:</Text>
              <Text style={styles.topMedicineName}>{topMedicine['Medicine Name']}</Text>
              
            </View>
          )}

          {/* Results List */}
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContainer}
          />
        </>
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
    paddingBottom: 100,
  },
  icon: {
    marginRight: 10,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  tokensContainer: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    width: '90%',
  },
  tokensTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tokensText: {
    fontSize: 14,
    color: '#555',
  },
  
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    marginHorizontal: 10,
    backgroundColor: '#FF4D6D',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 18,
    width: 150,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '100%',
  },
  listContainer: {
    width: '100%',
    paddingBottom: 50, // Additional bottom padding for the list
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
  topMedicineContainer: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
  topMedicineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 5,
  },
  topMedicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  topMedicineMatches: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});

export default ScanScreen;
