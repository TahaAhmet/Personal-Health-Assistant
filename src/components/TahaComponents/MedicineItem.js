import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MedicineItem = ({ name, time, id, deleteMedicine }) => (
  <View style={styles.medicineItem}>
    <Text style={styles.medicineText}>{name} - {time}</Text>
    <TouchableOpacity onPress={() => deleteMedicine(id)}>
      <Text style={styles.deleteText}>Sil</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#E0E7EF',
    marginBottom: 10,
    borderRadius: 8,
  },
  medicineText: {
    fontSize: 16,
    color: '#333',
  },
  deleteText: {
    color: '#FF5252',
    fontWeight: '600',
  },
});

export default MedicineItem;
