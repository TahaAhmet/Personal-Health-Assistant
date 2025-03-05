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
import BottomNavBar from './BottomNavbar'; // Alt navigasyon bileşenini içe aktarıyoruz
import { database, auth } from './firebase';
import { ref, push, onValue, update, remove } from 'firebase/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MedicineScreen() {
  const [medName, setMedName] = useState('');
  const [doseTimes, setDoseTimes] = useState([]); // Date nesnelerinden oluşan dizi
  const [showPicker, setShowPicker] = useState(false);
  const [reminders, setReminders] = useState([]);  // Realtime Database'den çekilen hatırlatmalar
  const [editingReminderId, setEditingReminderId] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync();
    fetchReminders();
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

  // 'reminders' dalını referans alıyoruz.
  const remindersRef = ref(database, `users/${auth.currentUser.uid}/reminders`);

  function fetchReminders() {
    onValue(remindersRef, (snapshot) => {
      const data = snapshot.val();
      const loadedReminders = data
        ? Object.keys(data).map(key => {
            const reminder = data[key];
            reminder.id = key;
            reminder.doseTimes = reminder.doseTimes 
              ? reminder.doseTimes.map(time => new Date(time))
              : [];
            return reminder;
          })
        : [];
      setReminders(loadedReminders);
    });
  }

  const addDoseTime = (date) => {
    setDoseTimes(prev => [...prev, date]);
  };

  const onDoseTimeChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      addDoseTime(date);
    }
  };

  const scheduleReminder = async () => {
    if (!medName.trim()) {
      Alert.alert('Lütfen ilaç adını girin.');
      return;
    }
    if (doseTimes.length === 0) {
      Alert.alert('Lütfen en az bir doz zamanı ekleyin.');
      return;
    }

    const now = new Date();
    let notificationIds = [];

    for (let dt of doseTimes) {
      let scheduledTime = new Date();
      scheduledTime.setHours(dt.getHours(), dt.getMinutes(), 0, 0);
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      try {
        const notifId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'İlaç Hatırlatma',
            body: `Zamanı geldi: ${medName}`,
            sound: 'default',
          },
          trigger: scheduledTime,
        });
        notificationIds.push(notifId);
      } catch (error) {
        Alert.alert('Hata', 'Bildirim ayarlanırken bir hata oluştu.');
        console.log(error);
      }
    }

    const reminderData = {
      medName,
      doseTimes: doseTimes.map(dt => dt.getTime()),
      notificationIds,
    };

    if (editingReminderId) {
      const reminderToUpdateRef = ref(database, `users/${auth.currentUser.uid}/reminders/${editingReminderId}`);
      update(reminderToUpdateRef, reminderData)
        .then(() => {
          Alert.alert('Hatırlatma Güncellendi!', `${medName} için hatırlatma güncellendi.`);
        })
        .catch((error) => {
          Alert.alert('Hata', 'Hatırlatma güncellenirken hata oluştu.');
          console.log(error);
        });
      setEditingReminderId(null);
    } else {
      push(remindersRef, reminderData)
        .then(() => {
          Alert.alert('Hatırlatma Kaydedildi!', `${medName} için hatırlatma ayarlandı.`);
        })
        .catch((error) => {
          Alert.alert('Hata', 'Hatırlatma eklenirken hata oluştu.');
          console.log(error);
        });
    }

    setMedName('');
    setDoseTimes([]);
  };

  const deleteReminder = async (reminderId, notificationIds) => {
    for (let id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    remove(ref(database, `users/${auth.currentUser.uid}/reminders/${reminderId}`))
      .then(() => {
        Alert.alert('Hatırlatma Silindi');
      })
      .catch((error) => {
        Alert.alert('Hata', 'Hatırlatma silinirken hata oluştu.');
        console.log(error);
      });
  };

  const editReminder = async (reminder) => {
    for (let id of reminder.notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    setMedName(reminder.medName);
    setDoseTimes(reminder.doseTimes);
    setEditingReminderId(reminder.id);
  };

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>İlaç Hatırlatma Uygulaması</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>İlaç Adı:</Text>
          <TextInput
            placeholder="İlaç adını girin"
            value={medName}
            onChangeText={setMedName}
            style={styles.input}
            placeholderTextColor="#7f8c8d"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Doz Zamanları:</Text>
          {doseTimes.length === 0 ? (
            <Text style={styles.infoText}>Henüz doz zamanı eklenmedi.</Text>
          ) : (
            doseTimes.map((time, index) => (
              <View key={index} style={styles.doseRow}>
                <Text style={styles.doseText}>{time.toLocaleTimeString()}</Text>
                <TouchableOpacity 
                  style={[styles.touchableButton, styles.buttonRed]}
                  onPress={() => setDoseTimes(prev => prev.filter((_, i) => i !== index))}
                >
                  <Text style={styles.buttonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <TouchableOpacity 
            style={[styles.touchableButton, styles.buttonBlue]}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.buttonText}>Doz Zamanı Ekle</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onDoseTimeChange}
            />
          )}
        </View>

        <View style={styles.saveButton}>
          <TouchableOpacity 
            style={[styles.touchableButton, styles.buttonGreen]}
            onPress={scheduleReminder}
          >
            <Text style={styles.buttonText}>
              {editingReminderId ? "Güncelle" : "Hatırlatıcıyı Kaydet"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>Kaydedilen Hatırlatmalar</Text>
        {reminders.length === 0 ? (
          <Text style={styles.infoText}>Henüz hatırlatma kaydedilmedi.</Text>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>{reminder.medName}</Text>
              <Text style={styles.subHeader}>Doz Zamanları:</Text>
              {reminder.doseTimes.map((time, index) => (
                <Text key={index} style={styles.reminderDose}>
                  {new Date(time).toLocaleTimeString()}
                </Text>
              ))}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.touchableButton, styles.buttonOrange]}
                  onPress={() => editReminder(reminder)}
                >
                  <Text style={styles.buttonText}>Düzenle</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.touchableButton, styles.buttonRed, { marginLeft: 10 }]}
                  onPress={() => deleteReminder(reminder.id, reminder.notificationIds)}
                >
                  <Text style={styles.buttonText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Alt navigasyon bileşeni */}
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
  inputContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  },
  infoText: {
    marginBottom: 10,
    fontStyle: 'italic',
    color: '#7f8c8d',
  },
  doseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  doseText: {
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
  buttonRed: {
    backgroundColor: '#e74c3c',
  },
  buttonBlue: {
    backgroundColor: '#2980b9',
    marginVertical: 5,
  },
  buttonGreen: {
    backgroundColor: '#27ae60',
  },
  buttonOrange: {
    backgroundColor: '#f39c12',
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
  reminderDose: {
    fontSize: 16,
    marginLeft: 10,
    color: '#2c3e50',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'flex-end',
  },
});
