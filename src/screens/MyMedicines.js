import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, Vibration } from 'react-native';
import { firestore, auth, serverTimestamp } from '../../firebase';
import MedicineList from '../components/TahaComponents/MedicineList';

const MyMedicines = () => {
    const [medicineName, setMedicineName] = useState('');
    const [medicineTime, setMedicineTime] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [editingMedicineId, setEditingMedicineId] = useState(null);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (!userId) return;
        const unsubscribe = firestore
            .collection('users')
            .doc(userId)
            .collection('medicines')
            .onSnapshot(snapshot => {
                const meds = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMedicines(meds);
            });
        return () => unsubscribe();
    }, [userId]);

    // 📢 Yeni ilaç ekleme ve düzenleme
    const addOrUpdateMedicine = async () => {
        if (!medicineName || !medicineTime) {
            Alert.alert('Lütfen hem ilaç adını hem de saatini girin.');
            return;
        }

        const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeFormat.test(medicineTime)) {
            Alert.alert('Saat formatı hatalı. Lütfen HH:mm formatında girin.');
            return;
        }

        const [hour, minute] = medicineTime.split(':').map(Number);
        const now = new Date();
        const alarmTime = new Date();
        alarmTime.setHours(hour);
        alarmTime.setMinutes(minute);
        alarmTime.setSeconds(0);

        if (alarmTime > now) {
            setTimeout(() => {
                triggerAlarm(); // Alarm tetikleme
            }, alarmTime.getTime() - now.getTime());
        }

        try {
            if (editingMedicineId) {
                await firestore.collection('users').doc(userId).collection('medicines').doc(editingMedicineId).update({
                    name: medicineName,
                    time: medicineTime,
                });
                Alert.alert('İlaç başarıyla güncellendi!');
            } else {
                await firestore.collection('users').doc(userId).collection('medicines').add({
                    name: medicineName,
                    time: medicineTime,
                    createdAt: serverTimestamp(),
                });
                Alert.alert('İlaç başarıyla eklendi!');
            }
            setMedicineName('');
            setMedicineTime('');
            setEditingMedicineId(null);
        } catch (error) {
            console.error('İlaç eklenirken veya güncellenirken hata:', error);
        }
    };

    // 📢 Titreşimle Alarm Fonksiyonu
    const triggerAlarm = () => {
        const vibrationPattern = [1000, 2000, 1000]; // 1 saniye titreşim, 2 saniye durma
        Vibration.vibrate(vibrationPattern, true); // Sürekli titreşim

        Alert.alert('İlaç Zamanı!', 'İlacını almayı unutma!', [
            {
                text: 'Tamam',
                onPress: () => Vibration.cancel(), // Titreşimi durdur
            },
        ]);
    };

    // 📢 İlaç Silme
    const deleteMedicine = async (id) => {
        try {
            await firestore.collection('users').doc(userId).collection('medicines').doc(id).delete();
            Alert.alert('İlaç başarıyla silindi.');
        } catch (error) {
            console.error('İlaç silinirken hata:', error);
        }
    };

    // 📢 İlaç Düzenleme Moduna Geçme
    const startEditing = (medicine) => {
        setMedicineName(medicine.name);
        setMedicineTime(medicine.time);
        setEditingMedicineId(medicine.id);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>İlaçlarım</Text>
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
                    onChangeText={(text) => {
                        if (text.length === 2 && !text.includes(':')) {
                            setMedicineTime(text + ':');
                        } else if (text.length <= 5) {
                            setMedicineTime(text);
                        }
                    }}
                    maxLength={5}
                    keyboardType="numeric"
                />
                <TouchableOpacity style={styles.button} onPress={addOrUpdateMedicine}>
                    <Text style={styles.buttonText}>
                        {editingMedicineId ? 'Güncelle' : 'Ekle'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 📢 MedicineList Bileşeni */}
            <MedicineList
                medicines={medicines}
                deleteMedicine={deleteMedicine}
                editMedicine={startEditing}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F0F4F8' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
    button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16 },
});

export default MyMedicines;
