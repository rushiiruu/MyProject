import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import axios from 'axios';

const API_URL = 'http://10.0.2.2:5000'; // Use this for Android emulator
// const API_URL = 'http://localhost:5000'; // Use this for iOS simulator

const ScanScreen = () => {
  const [scanning, setScanning] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [matchedMedicines, setMatchedMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkInitialPermissions();
  }, []);

  const checkInitialPermissions = async () => {
    try {
      const cameraPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const galleryPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const [cameraResult, galleryResult] = await Promise.all([
        request(cameraPermission),
        request(galleryPermission),
      ]);

      if (
        cameraResult !== RESULTS.GRANTED ||
        galleryResult !== RESULTS.GRANTED
      ) {
        Alert.alert(
          'Permissions Required',
          'Both camera and gallery permissions are needed for full functionality.',
          [
            {
              text: 'Grant Permissions',
              onPress: () => checkInitialPermissions(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  const handleImageCapture = async imageData => {
    try {
      setScanning(true);
      setImageUri(imageData.uri);
      setMatchedMedicines([]);
      setSelectedMedicine(null);

      const formData = new FormData();
      formData.append('image', {
        uri: imageData.uri,
        type: 'image/jpeg',
        name: 'medicine.jpg',
      });

      const response = await axios.post(`${API_URL}/scan-medicine`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.medicines && response.data.medicines.length > 0) {
        setMatchedMedicines(response.data.medicines);
        // Automatically fetch details for the first match
        fetchMedicineDetails(response.data.medicines[0].id);
      } else {
        Alert.alert('No Match', 'No matching medicines found in the database.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image. Please try again.');
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const fetchMedicineDetails = async medicineId => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medicine/${medicineId}`);
      setSelectedMedicine(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch medicine details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          handleImageCapture(response.assets[0]);
        }
      } else {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to scan medicines',
          [
            {
              text: 'OK',
              onPress: () => launchCameraWithPermission(),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access camera: ' + error.message);
    }
  };

  const pickImageWithPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        const options = {
          mediaType: 'photo',
          quality: 1,
        };

        const response = await launchImageLibrary(options);
        if (!response.didCancel && response.assets && response.assets[0]) {
          handleImageCapture(response.assets[0]);
        }
      } else {
        Alert.alert(
          'Gallery Permission Required',
          'Please grant gallery access to select images',
          [
            {
              text: 'OK',
              onPress: () => pickImageWithPermission(),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access gallery: ' + error.message);
    }
  };

  const renderMedicineItem = ({item}) => (
    <TouchableOpacity
      style={styles.medicineItem}
      onPress={() => fetchMedicineDetails(item.id)}>
      <Text style={styles.medicineName}>{item.name}</Text>
      <Text style={styles.medicineType}>{item.type}</Text>
      <Text style={styles.medicineDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderMedicineDetails = () => {
    if (!selectedMedicine) return null;

    return (
      <ScrollView style={styles.detailsContainer}>
        <Text style={styles.medicineTitle}>{selectedMedicine.name}</Text>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Manufacturer:</Text>
          <Text style={styles.value}>{selectedMedicine.manufacturer}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Uses:</Text>
          <Text style={styles.value}>{selectedMedicine.uses}</Text>
        </View>
        <View style={styles.infoSection}>
          <Text style={styles.label}>Side Effects:</Text>
          <Text style={styles.value}>{selectedMedicine.sideEffects}</Text>
        </View>
      </ScrollView>
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
      ) : matchedMedicines.length > 0 ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Matched Medicines:</Text>
          <FlatList
            data={matchedMedicines}
            renderItem={renderMedicineItem}
            keyExtractor={item => item.id}
            style={styles.matchesList}
          />
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            renderMedicineDetails()
          )}
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageContainer: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  matchesList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  medicineItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicineType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
  },
  medicineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});

export default ScanScreen;