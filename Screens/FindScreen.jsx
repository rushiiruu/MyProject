import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';
import * as Papa from 'papaparse';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FindScreen = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef(null);

  const loadCSV = async () => {
    try {
      const csvContent = await RNFS.readFileAssets(
        'Medicine_Details.csv',
        'utf8',
      );
      Papa.parse(csvContent, {
        header: true,
        complete: result => {
          setData(result.data);
          setIsLoading(false);
        },
        error: error => {
          console.error('Papa Parse Error:', error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      console.error('Error in loadCSV:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCSV();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (data.length === 0) loadCSV();
      setTimeout(() => inputRef.current?.focus(), 100);
    });

    return unsubscribe;
  }, [navigation, data]);

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const results = data.filter(item => {
        const medicineName = item['Medicine Name']?.toLowerCase() || '';
        return medicineName.includes(searchQuery.toLowerCase());
      });
      setFilteredData(results);
    } else {
      setFilteredData([]);
    }
  }, [searchQuery, data]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('MedicineDetailsScreen', {medicine: item})
      }>
      <Text style={styles.medicineName}>{item['Medicine Name']}</Text>
      <Text style={styles.uses}>{item['Uses']}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B8A" />
        <Text style={styles.loadingText}>Loading Medicine Database...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Curved Box with Search Input */}
      <View style={styles.curvedBox}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#90CAF9"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search for medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            enablesReturnKeyAutomatically={true}
          />
        </View>
      </View>

      <View style={styles.contentWrapper}>
        {/* Conditionally render Popular Searches Section */}
        {filteredData.length === 0 && (
          <>
            <Text style={styles.popularText}>Popular Searches</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.medicinesContainer}>
              <View style={styles.medicineBox}>
                <Text style={styles.medicineTitle}>Paracetamol</Text>
                <Text style={styles.medicineDescription}>
                  Pain reliever and fever reducer.
                </Text>
              </View>
              <View style={styles.medicineBox}>
                <Text style={styles.medicineTitle}>Ibuprofen</Text>
                <Text style={styles.medicineDescription}>
                  Anti-inflammatory and pain relief.
                </Text>
              </View>
              <View style={styles.medicineBox}>
                <Text style={styles.medicineTitle}>Amoxicillin</Text>
                <Text style={styles.medicineDescription}>
                  Antibiotic used to treat infections.
                </Text>
              </View>
            </ScrollView>
          </>
        )}

        {/* Search Results */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            searchQuery.trim() !== '' && (
              <Text style={styles.noResults}>No results found</Text>
            )
          }
          style={styles.list}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  curvedBox: {
    backgroundColor: '#687DBF',
    paddingHorizontal: 30,
    paddingTop: 90, // Increased padding to move the search bar lower
    borderBottomLeftRadius: 50,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200, // Increased height for better layout
  },
  searchInput: {
    height: 40,
    borderColor: '#90CAF9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    width: '100%', // Set to 90% of the parent width
    alignSelf: 'center', // Center the input horizontally
  },
  contentWrapper: {
    marginTop: 220, // Adjusted based on new curvedBox height
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
  },
  popularText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27100B',
    marginVertical: 10,
  },
  popularSearchContainer: {
    marginBottom: 5,
    maxHeight: 80, // Adjusted height for the container
  },
  popularUsesText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  popularItem: {
    backgroundColor: '#FF6B8A',
    borderRadius: 15,
    padding: 10,
    marginRight: 10,
  },
  popularItemText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemContainer: {
    padding: 15,
    backgroundColor: '#FF6B8A',
    marginVertical: 5,
    borderRadius: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  uses: {
    marginTop: 5,
    fontSize: 14,
    color: '#FFFFFF',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#757575',
  },
  list: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#90CAF9',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    width: '100%', // Adjust as needed
    alignSelf: 'center', // Center the input horizontally
  },
  searchIcon: {
    marginRight: 5, // Space between icon and text input
  },
  medicinesContainer: {
    marginTop: 30,
  },
  medicineBox: {
    backgroundColor: '#FF6B8A', // Curved box color
    borderRadius: 15,
    padding: 15,
    marginRight: 15, // Space between boxes
    width: 150, // Set a width for each box
    height: 150,
  },
  medicineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Text color for titles
  },
  medicineDescription: {
    fontSize: 14,
    color: '#FFFFFF', // Text color for descriptions
  },
});

export default FindScreen;
