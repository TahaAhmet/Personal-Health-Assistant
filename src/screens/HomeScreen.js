import React, { useEffect, useState } from 'react';
import moment from 'moment'
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import EmergencyButton from "../components/TahaComponents/EmergencyButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';


const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const [dailyTips, setDailyTips] = useState('');
  const [upcomingMedicines, setUpcomingMedicines] = useState([]);

  useEffect(() => {
    const fetchUserName = async () => {
      const user = 'Ahmet';
      setUserName(user);
    };

    const fetchDailyTip = () => {
      const tips = [
        'Bugün bol su içmeyi unutmayın!',
        'İlaçlarınızı zamanında alın.',
        '15 dakika hafif egzersiz yapmaya çalışın.',
        'Günde en az 7 saat uyumaya özen gösterin.',
        'Sigara ve alkolden uzak durun.'
      ];
      setDailyTips(tips[Math.floor(Math.random() * tips.length)]);
    };

    const loadMedicines = async () => {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        const medicines = JSON.parse(storedMedicines);
        const currentTime = moment();

        // Yaklaşan ilaçları filtrele ve bildirimi ayarla
        const upcoming = medicines.filter((med) => {
          const medTime = moment(med.time, 'HH:mm');
          const diffHours = medTime.diff(currentTime, 'hours');
          if (diffHours <= 12 && diffHours >= 0) {
            scheduleNotification(med);  // Bildirim ayarla
            return true;
          }
          return false;
        });

        setUpcomingMedicines(upcoming);
      }
    };

    const scheduleNotification = (medicine) => {
      const medTime = moment(medicine.time, 'HH:mm');
      const delay = medTime.diff(moment(), 'milliseconds');
      
      PushNotification.localNotificationSchedule({
        message: `${medicine.name} ilacını alma zamanı!`, 
        date: new Date(Date.now() + delay), 
        allowWhileIdle: true,
      });
    };

    fetchUserName();
    fetchDailyTip();
    loadMedicines();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz, {userName}!</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Günlük Sağlık Önerisi</Text>
        <Text style={styles.tipText}>{dailyTips}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yaklaşan İlaç Hatırlatmaları</Text>
        {upcomingMedicines.length > 0 ? (
          upcomingMedicines.map((med, index) => (
            <Text key={index} style={styles.reminderText}>
              {med.name} - {med.time} ({moment(med.time, 'HH:mm').fromNow()})
            </Text>
          ))
        ) : (
          <Text style={styles.reminderText}>Yaklaşan ilaç yok</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Takip Sistemi</Text>
        <Text style={styles.reminderText}>
          Google Map olabilir burada veya takip sistemi ile alakalı bilgiler
        </Text>
      </View>

      <EmergencyButton />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4F8',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)', 
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  section: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 16,
    color: '#555',
  },
  reminderText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
});

export default HomeScreen;
