import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import * as Papa from 'papaparse';
import debounce from 'lodash.debounce';
import {useFocusEffect} from '@react-navigation/native';

const HomeScreen = ({navigation}) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localQuery, setLocalQuery] = useState(''); // Immediate input update
  const inputRef = useRef(null);

  const loadCSV = async () => {
    try {
      const csvContent = await RNFS.readFileAssets('Medicine_Info.csv', 'utf8');
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

  // Debounce search query updates
  const handleSearch = debounce((query) => {
    setSearchQuery(query);
  }, 300);

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

  useFocusEffect(
    React.useCallback(() => {
      // Reset search query and input when screen regains focus
      setSearchQuery('');
      setLocalQuery('');
    }, [])
  );

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
        <ActivityIndicator size="large" color="#FF4D6D" />
        <Text style={styles.loadingText}>
          Just A Moment - Unpacking Medicine Info!
        </Text>
      </View>
    );
  }

  const renderContent = () => {
    if (searchQuery.trim() !== '') {
      return (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.noResults}>No results found</Text>
          }
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
      );
    }
  
    // Filter for specific medicines
    const popularMedicines = data.filter(item => 
      ['Biogesic Paracetamol 500 mg', 'Alaxan FR', 'RiteMED Amoxicillin 500 mg'].includes(item['Medicine Name'])
    );
  
    return (
      <>
        <View style={styles.curvedBox}>
          <Image
            source={require('../src/assets/fem.png')}
            style={styles.image}
            resizeMode="contain"
          />
          <View style={styles.rightContent}>
            <Text style={styles.scanText}>Ready to know your medicine?</Text>
            <Text style={styles.scanSubText}>Scan your receipt here!</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => navigation.navigate('Scan')}>
              <Icon name="scan-outline" size={30} color="#687DBF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.PopularText}>Popular Searches</Text>
        <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  style={styles.medicinesContainer}>
  {popularMedicines.map((item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.medicineBox}
      onPress={() => navigation.navigate('MedicineDetailsScreen', {medicine: item})}>
      <ScrollView contentContainerStyle={styles.scrollableContent}>
        <Text style={styles.medicineTitle}>{item['Medicine Name']}</Text>
        <Text style={styles.medicineDescription}>{item['Uses']}</Text>
      </ScrollView>
    </TouchableOpacity>
  ))}
</ScrollView>

      </>
    );
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.staticContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Hi there, </Text>
          <Text style={styles.titleText}>
            Welcome to <Text style={styles.curaText}>Cura</Text>!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-circle" size={35} color="#FF4D6D" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#90CAF9"
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search for medicines..."
            placeholderTextColor="#929292"
            value={localQuery}
            onChangeText={(text) => {
              setLocalQuery(text); // Update input immediately
              handleSearch(text);  // Debounce actual search update
            }}
            autoFocus={false}
            enablesReturnKeyAutomatically={true}
          />
        </View>
      </View>
      <View style={styles.dynamicContent}>{renderContent()}
        <Text style={styles.Text}>HELLOOOOOOOOOOOOOOOOOOOOOOOO</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },
  staticContent: {
    padding: 20,
  },
  dynamicContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  header: {
    alignItems: 'flex-start',
    marginLeft: 10,
    marginBottom: 20,
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#261600',
    marginBottom: 0,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#261600',
  },
  curaText: {
    color: '#E34766',
  },
  scrollableContent: {
    flexGrow: 1,
    paddingBottom: 10, // Optional for spacing
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderColor: '#F2F2F2',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
    marginHorizontal: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 5,
    color: '#929292', // Change to pink
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#929292',
  },
  profileIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  curvedBox: {
    backgroundColor: '#687DBF',
    borderRadius: 30,
    paddingVertical: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    position: 'absolute',
    bottom: 0,
    left: 20,
  },
  rightContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 150,
  },
  scanText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 5,
  },
  scanSubText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '200',
    marginBottom: 10,
  },
  scanButton: {
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 10,
    alignSelf: 'flex-start',
    marginLeft: 120,
  },
  PopularText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27100B',
    marginTop: 15,
    marginLeft: 10,
  },

  medicineBox: {
    backgroundColor: '#E34766',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150,
    height: 230,
  },
  medicineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  medicineDescription: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 5,
    borderRadius: 8,
    marginHorizontal: 10,
    elevation: 3,
  },

  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#414141',
  },
  uses: {
    marginTop: 5,
    fontSize: 14,
    color: '#414141',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#757575',
  },
});

export default HomeScreen;
