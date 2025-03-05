import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import { Ionicons } from '@expo/vector-icons';
import { database } from './firebase'; // Firebase yapılandırması
import { ref, set } from 'firebase/database';

// Cihaz UID'sini geçersiz karakterlerden arındırarak oluşturma fonksiyonu
const getCleanedDeviceId = () => {
  // Device.osBuildId, Android cihazlarda mevcut olabilir; iOS için alternatif yöntem kullanılabilir.
  return (Device.osBuildId || 'default-device-id').replace(/[.#$[\]]/g, '_');
};

// Arka plan görev adı
const LOCATION_TASK_NAME = 'background-location-task';

// Arka plan görevini tanımlama
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Arka plan görevi hatası:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      const { latitude, longitude } = location.coords;
      // Cihaz UID'sini kullanıyoruz
      const deviceId = getCleanedDeviceId();

      try {
        const locationRef = ref(database, `locations/${deviceId}`);
        await set(locationRef, {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
        console.log('Arka planda konum Firebase\'e kaydedildi:', { latitude, longitude, deviceId });
      } catch (error) {
        console.error('Firebase\'e konum kaydedilirken hata oluştu:', error);
      }
    }
  }
});

export default function ChildDevice({ onBack }) {
  // Cihaz UID'sini oluşturup state'e atıyoruz
  const deviceId = getCleanedDeviceId();
  const [statusMessage, setStatusMessage] = useState('Cihaz konum takibi başlatılıyor...');

  useEffect(() => {
    (async () => {
      // Konum izni al
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Konum izni verilmedi.');
        setStatusMessage('Konum izni verilmedi.');
        return;
      }

      // Arka plan izni al
      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        console.error('Arka plan izni verilmedi.');
        setStatusMessage('Arka plan izni verilmedi.');
        return;
      }

      // İlk konumu al ve kaydet
      try {
        const initialLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = initialLocation.coords;

        const locationRef = ref(database, `locations/${deviceId}`);
        await set(locationRef, {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
        console.log('İlk konum Firebase\'e kaydedildi:', { latitude, longitude, deviceId });
        setStatusMessage('Cihaz konum takibi aktif.');
      } catch (error) {
        console.error('İlk konum alınırken hata oluştu:', error);
        setStatusMessage('İlk konum alınırken hata oluştu.');
      }

      // Arka plan konum izlemeyi başlat
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 1, // 1 metre aralıkla takip
        deferredUpdatesInterval: 1000, // 1 saniyede bir gönderim
        foregroundService: {
          notificationTitle: 'Konum Takip Ediliyor',
          notificationBody: 'Arka planda konumunuz izleniyor.',
        },
      });

      console.log('Arka planda konum izleme başlatıldı.');
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.status}>{statusMessage}</Text>
      {/* Kullanıcıya cihaz UID'si ekranda gösteriliyor */}
      <Text style={styles.uid}>Cihaz UID: {deviceId}</Text>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back-outline" size={22} color="#fff" style={styles.icon} />
        <Text style={styles.backButtonText}>Ana Ekrana Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  uid: {
    fontSize: 20,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#0d47a1',
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
});
