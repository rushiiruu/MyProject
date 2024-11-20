import React from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';

const MedicineInfo = ({route}) => {
  const {medicine} = route.params; // Get the passed medicine data

  return (
    <ScrollView style={styles.container}>
      <Image source={{uri: medicine['Image URL']}} style={styles.image} />
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27100B',
    marginBottom: 10,
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

export default MedicineInfo;
