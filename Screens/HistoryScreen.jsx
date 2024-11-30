import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAuth} from 'firebase/auth';

const HistoryScreen = ({navigation, route}) => {
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      loadFavorites();
    }

    const unsubscribe = navigation.addListener('focus', () => {
      if (userId) {
        loadFavorites();
      }
    });

    return unsubscribe;
  }, [navigation, userId]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (!user) {
        setFavorites([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesKey = `favoriteMedicines_${userId}`;
      const storedFavorites = await AsyncStorage.getItem(favoritesKey);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const handleMedicinePress = medicine => {
    navigation.navigate('MedicineDetailsScreen', {medicine});
  };

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.noFavorites}>Please log in to view favorites</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Favorite Medicines</Text>
      {favorites.length === 0 ? (
        <Text style={styles.noFavorites}>No favorite medicines added yet</Text>
      ) : (
        favorites.map((medicine, index) => (
          <TouchableOpacity
            key={index}
            style={styles.favoriteItem}
            onPress={() => handleMedicinePress(medicine)}
            activeOpacity={0.7}>
            <Text style={styles.medicineName}>{medicine['Medicine Name']}</Text>
            <Text style={styles.medicineDetails}>Uses: {medicine.Uses}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#27100B',
  },
  favoriteItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27100B',
  },
  medicineDetails: {
    fontSize: 14,
    color: '#424242',
    marginTop: 5,
  },
  noFavorites: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;
