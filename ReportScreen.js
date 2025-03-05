import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  Platform, 
  ScrollView, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomNavBar from './BottomNavbar'; // Alt navigasyon bileşeni
import { database, auth } from './firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';

// Bildirim işleyicisini yapılandırıyoruz
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ReportScreen() {
  const [reportName, setReportName] = useState('');
  const [reportEndDate, setReportEndDate] = useState(null);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reports, setReports] = useState([]); // Firebase'den çekilen raporlar
  const [editingReportId, setEditingReportId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
    fetchReports();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Bildirim izni alınamadı!');
        return;
      }
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }
    } else {
      //Alert.alert('Bildirim için fiziksel bir cihaz kullanmalısınız.');
    }
  }

  // Kullanıcıya özel "reports" dalı referansı: users/<currentUserID>/reports
  const reportsRef = ref(database, `users/${auth.currentUser.uid}/reports`);

  // Firebase'den raporları dinleyip state güncelliyoruz.
  function fetchReports() {
    onValue(reportsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedReports = data
        ? Object.keys(data).map(key => {
            const report = data[key];
            report.id = key;
            // ISO string olarak kaydedilen tarihleri Date nesnesine çeviriyoruz.
            report.reportEndDate = report.reportEndDate ? new Date(report.reportEndDate) : null;
            report.reminderTime = report.reminderTime ? new Date(report.reminderTime) : new Date();
            return report;
          })
        : [];
      setReports(loadedReports);
    });
  }

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReportEndDate(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const scheduleReportReminder = async () => {
    if (!reportName.trim()) {
      Alert.alert('Lütfen rapor adını girin.');
      return;
    }
    if (!reportEndDate) {
      Alert.alert('Lütfen rapor bitiş tarihini seçin.');
      return;
    }
    
    // Rapor bitiş tarihinden 1 gün öncesini alıp, seçilen hatırlatma saatini ekliyoruz.
    const reminderDate = new Date(reportEndDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(reminderTime.getHours(), reminderTime.getMinutes(), 0, 0);

    const now = new Date();
    if (reminderDate <= now) {
      Alert.alert('Geçersiz Tarih/Saat', 'Seçtiğiniz hatırlatma tarihi ve saati geçmişte olamaz.');
      return;
    }

    try {
      // Düzenleme modunda, eski bildirimi iptal ediyoruz.
      if (editingReportId) {
        const reportToEdit = reports.find(r => r.id === editingReportId);
        if (reportToEdit) {
          await Notifications.cancelScheduledNotificationAsync(reportToEdit.notificationId);
        }
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Rapor Hatırlatma',
          body: `${reportName} raporunuzun son günü yaklaşıyor, lütfen raporunuzu tekrar yazdırın.`,
          sound: 'default',
        },
        trigger: reminderDate,
      });
      
      const reportData = {
        reportName,
        reportEndDate: reportEndDate.toISOString(),
        reminderTime: reminderDate.toISOString(),
        notificationId,
      };

      if (editingReportId) {
        // Rapor güncelleme
        update(ref(database, `users/${auth.currentUser.uid}/reports/${editingReportId}`), reportData)
          .then(() => {
            Alert.alert('Hatırlatma Güncellendi!', `${reportName} raporunuz için hatırlatma güncellendi.`);
          })
          .catch((error) => {
            Alert.alert('Hata', 'Hatırlatma güncellenirken hata oluştu.');
            console.log(error);
          });
        setEditingReportId(null);
      } else {
        // Yeni rapor ekleme
        push(reportsRef, reportData)
          .then(() => {
            Alert.alert('Hatırlatma Ayarlandı!', `${reportName} raporunuz için hatırlatma gönderilecek: ${reminderDate.toLocaleString()}`);
          })
          .catch((error) => {
            Alert.alert('Hata', 'Hatırlatma eklenirken hata oluştu.');
            console.log(error);
          });
      }
      
      // Form alanlarını sıfırla
      setReportName('');
      setReportEndDate(null);
    } catch (error) {
      Alert.alert('Hata', 'Bildirim ayarlanırken bir hata oluştu.');
      console.log(error);
    }
  };

  const deleteReport = async (reportId, notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      remove(ref(database, `users/${auth.currentUser.uid}/reports/${reportId}`))
        .then(() => {
          Alert.alert('Hatırlatma Silindi');
        })
        .catch((error) => {
          Alert.alert('Hata', 'Hatırlatma silinirken hata oluştu.');
          console.log(error);
        });
    } catch (error) {
      console.log("Bildirim iptal edilirken hata:", error);
    }
  };

  const handleEditReport = async (report) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(report.notificationId);
    } catch (error) {
      console.log("Bildirim iptal edilirken hata:", error);
    }
    setReportName(report.reportName);
    setReportEndDate(new Date(report.reportEndDate));
    setReminderTime(new Date(report.reminderTime));
    setEditingReportId(report.id);
  };

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Rapor Hatırlatma Uygulaması</Text>
        
        <Text style={styles.label}>Rapor Adı:</Text>
        <TextInput
          placeholder="Rapor adını girin"
          value={reportName}
          onChangeText={setReportName}
          style={styles.input}
        />

        <Text style={styles.label}>Rapor Bitiş Tarihi:</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {reportEndDate ? reportEndDate.toLocaleDateString() : 'Tarih seçilmedi'}
          </Text>
          <TouchableOpacity 
            style={[styles.touchableButton, styles.buttonBlue]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.buttonText}>Tarih Seç</Text>
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={reportEndDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        
        <Text style={styles.label}>Hatırlatma Saati:</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {reminderTime ? reminderTime.toLocaleTimeString() : 'Saat seçilmedi'}
          </Text>
          <TouchableOpacity 
            style={[styles.touchableButton, styles.buttonBlue]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.buttonText}>Saat Seç</Text>
          </TouchableOpacity>
        </View>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}

        <View style={styles.saveButton}>
          <TouchableOpacity 
            style={[styles.touchableButton, styles.buttonGreen]}
            onPress={scheduleReportReminder}
          >
            <Text style={styles.buttonText}>
              {editingReportId ? "Güncelle" : "Hatırlatıcıyı Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>Kaydedilen Hatırlatmalar</Text>
        {reports.length === 0 ? (
          <Text style={styles.infoText}>Henüz rapor eklenmedi.</Text>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>
               {report.reportName} - Bitiş: {new Date(report.reportEndDate).toLocaleDateString('tr-TR')}
              </Text>
              <Text style={styles.subHeader}>
              Hatırlatma: {new Date(report.reminderTime).toLocaleString('tr-TR')}
              </Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.touchableButton, styles.buttonOrange]}
                  onPress={() => handleEditReport(report)}
                >
                  <Text style={styles.buttonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.touchableButton, styles.buttonRed, { marginLeft: 10 }]}
                  onPress={() => deleteReport(report.id, report.notificationId)}
                >
                  <Text style={styles.buttonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Alt Navigasyon Bileşeni */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f0f4f7',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginVertical: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  touchableButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonBlue: {
    backgroundColor: '#2980b9',
  },
  buttonGreen: {
    backgroundColor: '#27ae60',
  },
  buttonOrange: {
    backgroundColor: '#f39c12',
  },
  buttonRed: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    marginVertical: 20,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subHeader: {
    fontSize: 16,
    marginTop: 10,
    color: '#34495e',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'flex-end',
  },
});
