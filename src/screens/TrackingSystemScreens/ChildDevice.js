import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as TaskManager from 'expo-task-manager';
import { database } from '../../../firebase'; // Firebase yapılandırması
import { ref, set } from 'firebase/database';

// Görev adı
const LOCATION_TASK_NAME = 'background-location-task';

// Cihaz kimliği oluşturma (geçersiz karakterlerden arındırılmış)
const getCleanedDeviceId = () => {
  return (Device.osBuildId || 'default-device-id').replace(/[.#$[\]]/g, '_');
};

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
      const deviceId = getCleanedDeviceId();

      try {
        const locationRef = ref(database, `locations/${deviceId}`);
        await set(locationRef, {
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
        console.log('Arka planda konum Firebase\'e kaydedildi:', { latitude, longitude });
      } catch (error) {
        console.error('Firebase\'e konum kaydedilirken hata oluştu:', error);
      }
    }
  }
});

export default function ChildDevice() {
  const deviceId = getCleanedDeviceId();

  useEffect(() => {
    (async () => {
      // Konum izni al
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Konum izni verilmedi.');
        return;
      }

      // Arka plan izni al
      const bgStatus = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        console.error('Arka plan izni verilmedi.');
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
        console.log('İlk konum Firebase\'e kaydedildi:', { latitude, longitude });
      } catch (error) {
        console.error('İlk konum alınırken hata oluştu:', error);
      }

      // Arka plan konum izlemeyi başlat
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 1, // 10 metre aralıkla takip
        deferredUpdatesInterval: 1000, // 5 saniyede bir gönderim
        foregroundService: {
          notificationTitle: 'Konum Takip Ediliyor',
          notificationBody: 'Arka planda konumunuz izleniyor.',
        },
      });

      console.log('Arka planda konum izleme başlatıldı.');
    })();
  }, []);

  return null; // Çocuk cihazı ekranda bir şey göstermiyor
}
