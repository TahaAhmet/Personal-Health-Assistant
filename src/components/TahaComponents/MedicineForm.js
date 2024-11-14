import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

const MedicineForm = ({ medicineName, setMedicineName, medicineTime, setMedicineTime, addMedicine }) => (
  <View>
    <TextInput
      style={styles.input}
      placeholder="İlaç Adı"
      value={medicineName}
      onChangeText={setMedicineName}
    />
    
    <TextInput
      style={styles.input}
      placeholder="Alınacak Saat (Örn. 08:00)"
      value={medicineTime}
      onChangeText={setMedicineTime}
    />

    <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
      <Text style={styles.addButtonText}>İlaç Ekle</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MedicineForm;
