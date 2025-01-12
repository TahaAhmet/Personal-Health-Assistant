import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Vibration } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

// Bildirim izni iste
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

// Alarm zamanlama ve tetikleme fonksiyonları
const scheduleAlarm = async (reportName, reportTime, reportId) => {
    const now = new Date();
    const triggerTime = new Date(reportTime);

    if (triggerTime <= now) {
        Alert.alert('Geçmiş bir tarih ve saat seçemezsiniz!');
        return;
    }

    const timeDifference = triggerTime.getTime() - now.getTime();

    setTimeout(() => {
        triggerAlarm(reportName, reportId); 
    }, timeDifference);
};

const triggerAlarm = async (reportName, reportId) => {
    const vibrationPattern = [1000, 2000, 1000];
    Vibration.vibrate(vibrationPattern, true);

    Alert.alert('📊 Rapor Hatırlatıcı!', `${reportName} raporunun zamanı geldi!`, [
        {
            text: 'Tamam',
            onPress: async () => {
                Vibration.cancel();
                if (reportId) {
                    await deleteReport(reportId);
                }
            },
        },
    ]);
    // 30 saniye sonra titreşimi otomatik olarak durdur
    setTimeout(() => {
        Vibration.cancel();
    }, 30000); 
    
};

const ReportReminderScreen = () => {
    const [reportName, setReportName] = useState('');
    const [reportTime, setReportTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [reports, setReports] = useState([]);
    const [editingReportId, setEditingReportId] = useState(null);
    const userId = auth.currentUser?.uid;
    const scrollViewRef = React.useRef(); 

    useEffect(() => {
        requestNotificationPermission();
        if (!userId) return;
        const unsubscribe = onSnapshot(collection(db, `users/${userId}/reports`), (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                formattedTime: new Date(doc.data().reminderTime).toLocaleDateString('tr-TR') + ' ' + new Date(doc.data().reminderTime).toLocaleTimeString('tr-TR')
            }));
            setReports(reportsData);
        });
        return () => unsubscribe();
    }, [userId]);

    const addOrUpdateReport = async () => {
        if (!reportName || !reportTime) {
            Alert.alert('Lütfen rapor adı ve tarih-saat girin.');
            return;
        }

        const now = new Date();
        if (reportTime <= now) {
            Alert.alert('Geçmiş bir tarih ve saat seçemezsiniz!');
            return;
        }

        try {
            if (editingReportId) {
                await updateDoc(doc(db, `users/${userId}/reports`, editingReportId), {
                    reportName,
                    reminderTime: reportTime.toISOString(),
                });
                await scheduleAlarm(reportName, reportTime, editingReportId);
                Alert.alert('Rapor başarıyla güncellendi!');
            } else {
                const reportRef = await addDoc(collection(db, `users/${userId}/reports`), {
                    reportName,
                    reminderTime: reportTime.toISOString(),
                    createdAt: serverTimestamp(),
                });
                await scheduleAlarm(reportName, reportTime, reportRef.id);
                Alert.alert('Rapor başarıyla eklendi!');
            }
            setReportName('');
            setReportTime(new Date());
            setEditingReportId(null);
        } catch (error) {
            console.error('Rapor eklenirken hata:', error);
        }
    };

    const deleteReport = async (id) => {
        try {
            await deleteDoc(doc(db, `users/${userId}/reports`, id));
            Alert.alert('Rapor başarıyla silindi.');
        } catch (error) {
            console.error('Rapor silinirken hata:', error);
        }
    };

    const startEditing = (report) => {
        setReportName(report.reportName);
        setReportTime(new Date(report.reminderTime));
        setEditingReportId(report.id);

        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView ref={scrollViewRef}>
                <Text style={styles.title}>Rapor Hatırlatıcı</Text>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Rapor Adı"
                        value={reportName}
                        onChangeText={setReportName}
                    />
                    <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.buttonText}>Tarih Seç</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={reportTime}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setReportTime((prevDate) => {
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
                            value={reportTime}
                            mode="time"
                            display="default"
                            onChange={(event, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime) {
                                    setReportTime((prevDate) => {
                                        const updatedDate = new Date(prevDate);
                                        updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                                        return updatedDate;
                                    });
                                }
                            }}
                        />
                    )}
                    <Text style={styles.infoText}>Seçilen Tarih ve Saat: {reportTime.toLocaleDateString('tr-TR')} {reportTime.toLocaleTimeString('tr-TR')}</Text>
                    <TouchableOpacity style={styles.button} onPress={addOrUpdateReport}>
                        <Text style={styles.buttonText}>{editingReportId ? 'Güncelle' : 'Ekle'}</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Kaydedilen Raporlar</Text>
                {reports.map((report) => (
                    <View key={report.id} style={styles.reportCard}>
                        <Text style={styles.infoText}>{report.reportName} - {report.formattedTime}</Text>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.smallButton} onPress={() => startEditing(report)}>
                                <Text style={styles.buttonText}>Düzenle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.smallButtonDelete} onPress={() => deleteReport(report.id)}>
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
    form: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 10 },
    button: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, alignItems: 'center', marginBottom: 10 },
    buttonText: { color: '#fff', fontSize: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    smallButtonDelete: { backgroundColor: '#FF0000', padding: 10, borderRadius: 5, flex: 1 },
    smallButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
    infoText: { fontSize: 16 },
    subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
    reportCard: { padding: 15, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', marginBottom: 10 }
});

export default ReportReminderScreen;
