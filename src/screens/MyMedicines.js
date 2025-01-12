import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Vibration } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Bildirim izni verilmedi. Lütfen izin verin.');
    }
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const scheduleAlarm = async (medicineName, medicineTime, medicineId) => {
    const now = new Date();
    const triggerTime = new Date(medicineTime);

    if (triggerTime <= now) {
        Alert.alert('Geçmiş bir tarih ve saat seçemezsiniz!');
        return;
    }

    const timeDifference = triggerTime.getTime() - now.getTime();

    setTimeout(() => {
        triggerAlarm(medicineName, medicineId);
    }, timeDifference);
};

const triggerAlarm = async (medicineName, medicineId) => {
    const vibrationPattern = [1000, 2000, 1000];
    Vibration.vibrate(vibrationPattern, true);

    Alert.alert('💊 İlaç Hatırlatma!', `${medicineName} ilacını alma zamanı geldi!`, [
        {
            text: 'Tamam',
            onPress: async () => {
                Vibration.cancel();
                if (medicineId) {
                    await deleteMedicine(medicineId);
                }
            },
        },
    ]);

    setTimeout(() => {
        Vibration.cancel();
    }, 30000); 
};

const MyMedicines = () => {
    const [medicineName, setMedicineName] = useState('');
    const [medicineTime, setMedicineTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [editingMedicineId, setEditingMedicineId] = useState(null);
    const userId = auth.currentUser?.uid;
    const scrollViewRef = React.useRef();

    useEffect(() => {
        requestNotificationPermission();
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, `users/${userId}/medicines`), (snapshot) => {
            const meds = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                formattedTime: new Date(doc.data().time).toLocaleDateString('tr-TR') + ' ' + new Date(doc.data().time).toLocaleTimeString('tr-TR')
            }));
            setMedicines(meds);
        });
        return () => unsubscribe();
    }, [userId]);

    const addOrUpdateMedicine = async () => {
        if (!medicineName || !medicineTime) {
            Alert.alert('Lütfen hem ilaç adını hem de tarihini girin.');
            return;
        }

        const now = new Date();
        if (medicineTime.getTime() <= now.getTime()) {
            Alert.alert('Geçmiş bir tarih ve saat seçemezsiniz!');
            return;
        }

        try {
            if (editingMedicineId) {
                await updateDoc(doc(db, `users/${userId}/medicines`, editingMedicineId), {
                    name: medicineName,
                    time: medicineTime.toISOString(),
                });
                await scheduleAlarm(medicineName, medicineTime, editingMedicineId);
                Alert.alert('İlaç başarıyla güncellendi ve alarm ayarlandı!');
            } else {
                const docRef = await addDoc(collection(db, `users/${userId}/medicines`), {
                    name: medicineName,
                    time: medicineTime.toISOString(),
                    createdAt: serverTimestamp(),
                });
                await scheduleAlarm(medicineName, medicineTime, docRef.id);
                Alert.alert('İlaç başarıyla eklendi!');
            }
            setMedicineName('');
            setMedicineTime(new Date());
            setEditingMedicineId(null);
        } catch (error) {
            console.error('İlaç eklenirken hata:', error);
        }
    };

    const deleteMedicine = async (id) => {
        try {
            await deleteDoc(doc(db, `users/${userId}/medicines`, id));
            Alert.alert('İlaç başarıyla silindi.');
        } catch (error) {
            console.error('İlaç silinirken hata:', error);
        }
    };

    const startEditing = (medicine) => {
        setMedicineName(medicine.name);
        setMedicineTime(new Date(medicine.time));
        setEditingMedicineId(medicine.id);

        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView ref={scrollViewRef}>
                <Text style={styles.title}>İlaçlarım</Text>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="İlaç Adı"
                        value={medicineName}
                        onChangeText={setMedicineName}
                    />
                    <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.buttonText}>Tarih Seç</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={medicineTime}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setMedicineTime((prevDate) => {
                                        const updatedDate = new Date(prevDate);
                                        updatedDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                        return updatedDate;
                                    });
                                }
                            }}
                        />
                    )}
                    <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
                        <Text style={styles.buttonText}>Saat Seç</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <DateTimePicker
                            value={medicineTime}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime) {
                                    setMedicineTime((prevDate) => {
                                        const updatedDate = new Date(prevDate);
                                        updatedDate.setHours(selectedTime.getHours());
                                        updatedDate.setMinutes(selectedTime.getMinutes());
                                        return updatedDate;
                                    });
                                }
                            }}
                        />
                    )}
                    <Text style={styles.infoText}>Seçilen Tarih ve Saat: {medicineTime.toLocaleDateString('tr-TR')} {medicineTime.toLocaleTimeString('tr-TR')}</Text>
                    <TouchableOpacity style={styles.button} onPress={addOrUpdateMedicine}>
                        <Text style={styles.buttonText}>{editingMedicineId ? 'Güncelle' : 'Ekle'}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Kaydedilen İlaçlar</Text>
                {medicines.map((medicine) => (
                    <View key={medicine.id} style={styles.medicineCard}>
                        <Text style={styles.infoText}>{medicine.name} - {medicine.formattedTime}</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.smallButton} onPress={() => startEditing(medicine)}>
                                <Text style={styles.buttonText}>Düzenle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.smallButtonDelete} onPress={() => deleteMedicine(medicine.id)}>
                                <Text style={styles.buttonText}>Sil</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F0F4F8' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', marginTop: 40 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
    button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontSize: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    smallButtonDelete: { backgroundColor: '#FF0000', padding: 10, borderRadius: 5, flex: 1 },
    smallButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
    infoText: { fontSize: 16 },
    subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
    medicineCard: { padding: 15, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', marginBottom: 10 }
});

export default MyMedicines;
