import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import {getAuth} from 'firebase/auth';

const MedicineDetailsScreen = ({route, navigation}) => {
  const {medicine} = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (userId) {
      checkFavoriteStatus();
    }
  }, [userId]);

  const checkFavoriteStatus = async () => {
    try {
      const favoritesKey = `favoriteMedicines_${userId}`;
      const favorites = await AsyncStorage.getItem(favoritesKey);
      if (favorites) {
        const favoritesArray = JSON.parse(favorites);
        setIsFavorite(
          favoritesArray.some(
            fav => fav['Medicine Name'] === medicine['Medicine Name'],
          ),
        );
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!userId) {
      // Handle case where user is not logged in
      return;
    }

    try {
      const favoritesKey = `favoriteMedicines_${userId}`;
      const favorites = await AsyncStorage.getItem(favoritesKey);
      let favoritesArray = favorites ? JSON.parse(favorites) : [];

      if (!isFavorite) {
        favoritesArray.push(medicine);
      } else {
        favoritesArray = favoritesArray.filter(
          fav => fav['Medicine Name'] !== medicine['Medicine Name'],
        );
      }

      await AsyncStorage.setItem(favoritesKey, JSON.stringify(favoritesArray));
      setIsFavorite(!isFavorite);
      navigation.setParams({favoritesUpdated: true});
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{uri: medicine['Image URL']}} style={styles.image} />
      <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
        <Icon
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={30}
          color={isFavorite ? 'red' : '#27100B'}
        />
      </TouchableOpacity>
      <Text style={styles.name}>{medicine['Medicine Name']}</Text>

      <Text style={styles.label}>Composition:</Text>
      <Text style={styles.text}>{medicine.Composition}</Text>
      <Text style={styles.label}>Uses:</Text>
      <Text style={styles.text}>{medicine.Uses}</Text>
      <Text style={styles.label}>Side Effects:</Text>
      <Text style={styles.text}>{medicine.Side_effects}</Text>
      <Text style={styles.label}>Manufacturer:</Text>
      <Text style={styles.text}>{medicine.Manufacturer}</Text>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27100B',
    marginRight: 10,
  },
  favoriteButton: {
    left: 320,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27100B',
    marginTop: 10,
  },
  text: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 10,
  },
});

export default MedicineDetailsScreen;
