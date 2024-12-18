import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { firestore, auth, serverTimestamp } from '../../firebase'; // firebase.js dosyasından import
import MedicineList from '../components/TahaComponents/MedicineList';

const MyMedicines = () => {
  const [medicineName, setMedicineName] = useState('');
  const [medicineTime, setMedicineTime] = useState('');
  const [medicines, setMedicines] = useState([]);
  const userId = auth.currentUser?.uid; // Firebase Auth kullanarak mevcut kullanıcı ID'sini alın

  useEffect(() => {
    if (userId) {
      const unsubscribe = firestore
        .collection('users')
        .doc(userId)
        .collection('medicines')
        .onSnapshot((querySnapshot) => {
          const meds = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMedicines(meds);
        });
      return () => unsubscribe();
    }
  }, [userId]);

  // Yeni ilaç ekleme işlevi
  const addMedicine = async () => {
    if (!medicineName || !medicineTime) {
      Alert.alert('Hata', 'Lütfen ilaç adı ve saatini girin.');
      return;
    }

    // Saat formatını kontrol et
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm formatında saat
    if (!timeFormat.test(medicineTime)) {
      Alert.alert('Hata', 'Saat formatı hatalı. Lütfen HH:mm formatında bir saat girin.');
      return;
    }

    // Aynı ilaç ve aynı saat kontrolü (aynı saatte aynı ilaç engelleniyor)
    const existingMedicine = medicines.find(
      (med) => med.time === medicineTime && med.name === medicineName
    );

    if (existingMedicine) {
      Alert.alert('Hata', `Bu ilaç zaten aynı saatte eklenmiş: ${medicineName} (${medicineTime})`);
      return;
    }

    const newMedicine = {
      name: medicineName,
      time: medicineTime,
      createdAt: serverTimestamp(),
    };

    try {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('medicines')
        .add(newMedicine);
      setMedicineName('');
      setMedicineTime('');
    } catch (error) {
      console.error('İlaç eklenirken hata oluştu:', error);
    }
  };

  // İlaç silme işlevi
  const deleteMedicine = async (id) => {
    try {
      await firestore
        .collection('users')
        .doc(userId)
        .collection('medicines')
        .doc(id)
        .delete();
    } catch (error) {
      console.error('İlaç silinirken hata oluştu:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>İlaçlarım</Text>

      {/* İlaç Ekleme Formu */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="İlaç Adı"
          value={medicineName}
          onChangeText={setMedicineName}
        />
        <TextInput
          style={styles.input}
          placeholder="Saat (HH:mm)"
          value={medicineTime}
          onChangeText={setMedicineTime}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={addMedicine}>
          <Text style={styles.buttonText}>Ekle</Text>
        </TouchableOpacity>
      </View>

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
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyMedicines;
