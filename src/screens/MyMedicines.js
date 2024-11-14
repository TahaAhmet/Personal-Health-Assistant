import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MedicineForm from '../components/TahaComponents/MedicineForm';  // Form bileşeni
import MedicineList from '../components/TahaComponents/MedicineList';  // Liste bileşeni

const MyMedicines = () => {
  const [medicineName, setMedicineName] = useState('');
  const [medicineTime, setMedicineTime] = useState('');
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    loadMedicines();
  }, []);

  // AsyncStorage'dan ilaçları yükleyin
  const loadMedicines = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }
    } catch (error) {
      console.error('İlaçları yüklerken hata oluştu:', error);
    }
  };

  // AsyncStorage'a ilaçları kaydedin
  const saveMedicines = async (updatedMedicines) => {
    try {
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
    } catch (error) {
      console.error('İlaçları kaydederken hata oluştu:', error);
    }
  };

  // Yeni ilaç ekleme işlevi
  const addMedicine = () => {
    if (medicineName && medicineTime) {
      const newMedicine = { name: medicineName, time: medicineTime, id: Date.now().toString() };
      const updatedMedicines = [...medicines, newMedicine];
      setMedicines(updatedMedicines);
      saveMedicines(updatedMedicines);
      setMedicineName('');
      setMedicineTime('');
    } else {
      Alert.alert('Hata', 'Lütfen ilaç adı ve saatini girin.');
    }
  };

  // İlaç silme işlevi
  const deleteMedicine = (id) => {
    const updatedMedicines = medicines.filter((med) => med.id !== id);
    setMedicines(updatedMedicines);
    saveMedicines(updatedMedicines);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İlaçlarım</Text>
      
      {/* İlaç Ekleme Formu */}
      <MedicineForm
        medicineName={medicineName}
        setMedicineName={setMedicineName}
        medicineTime={medicineTime}
        setMedicineTime={setMedicineTime}
        addMedicine={addMedicine}
      />
      
      {/* İlaç Listesi */}
      <MedicineList medicines={medicines} deleteMedicine={deleteMedicine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F4F8',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default MyMedicines;
