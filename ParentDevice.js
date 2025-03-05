//ParentDevice.js

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { database } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';
import SafeZoneSelector from './SafeZoneSelector'; // Güvenli alan seçimi bileşeni

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,  // Bildirimi ekranda göster
    shouldPlaySound: true,  // Ses çal
    shouldSetBadge: true,   // Uygulama ikonuna badge ekle
  }),
});


async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Bildirim izni verilmedi!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Fiziksel bir cihazda çalıştırmalısınız.');
  }
  return token;
}


function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Dünya yarıçapı (metre)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Metre cinsinden mesafe
}




export default function ParentDevice({ onBack }) {
  const [childLocation, setChildLocation] = useState(null);
  const [deviceUid, setDeviceUid] = useState('');
  const [currentUid, setCurrentUid] = useState(null);
  const [safeZone, setSafeZone] = useState(null);
  const [showSafeZoneSelector, setShowSafeZoneSelector] = useState(false); // Güvenli alan belirleme ekranı açık mı?
  const [pushToken, setPushToken] = useState(null);


  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setPushToken(token));
  }, []);

  useEffect(() => {
    if (!childLocation || !safeZone) return;

    const distance = getDistance(
      childLocation.latitude,
      childLocation.longitude,
      safeZone.center.latitude,
      safeZone.center.longitude
    );

    console.log(`Mesafe: ${distance} metre`);

    if (distance > safeZone.radius) {
      sendPushNotification(pushToken, 'Güvenli Alan Uyarısı', 'Çocuk güvenli alanın dışına çıktı!');
    }
  }, [childLocation, safeZone]);

  async function sendPushNotification(token, title, body) {
    if (!token) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        sound: 'default',
        title: title,
        body: body,
      }),
    });
  }




  useEffect(() => {
    if (!currentUid) return;

    // Firebase'den çocuk cihazın konumunu çek
    const locationRef = ref(database, `locations/${currentUid}`);
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChildLocation(data);
      }
    });

    // Firebase'den güvenli alanı çek
    const safeZoneRef = ref(database, `safeZones/${currentUid}`);
    const unsubscribeSafeZone = onValue(safeZoneRef, (snapshot) => {
      const zoneData = snapshot.val();
      console.log("Firebase'den gelen güvenli alan verisi:", zoneData);
      if (zoneData) {
        setSafeZone(zoneData);
      } else {
        console.log("Firebase'de bu UID için güvenli alan bulunamadı.");
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSafeZone();
    };
  }, [currentUid]);

  // Güvenli alanı kaydetme işlemi
  const handleSafeZoneSave = (zone) => {
    setSafeZone(zone);
    setShowSafeZoneSelector(false);
    if (currentUid) {
      const safeZoneRef = ref(database, `safeZones/${currentUid}`);
      set(safeZoneRef, zone);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#e3f2fd', '#90caf9']} style={styles.container}>
        {/* Üstte geri dön butonu */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Ana Ekrana Dön</Text>
          </TouchableOpacity>
        </View>

        {/* Ekran Başlığı */}
        <Text style={styles.title}>Çocuk Cihazının Konumu</Text>

        {/* UID Girişi */}
        {!currentUid && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Cihaz UID'sini girin"
              value={deviceUid}
              onChangeText={setDeviceUid}
              placeholderTextColor="#757575"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCurrentUid(deviceUid.trim())}
            >
              <Text style={styles.buttonText}>Göster</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Eğer güvenli alan belirleme modu açık değilse harita ve bilgiler göster */}
        {!showSafeZoneSelector ? (
          <>
            {/* Çocuk Konumu Haritası */}
            {childLocation && (
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  region={{
                    latitude: childLocation.latitude,
                    longitude: childLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: childLocation.latitude,
                      longitude: childLocation.longitude,
                    }}
                    title="Çocuk Cihazı"
                    description="Çocuk cihazının anlık konumu"
                  />
                  {safeZone && (
                    <Circle
                      center={safeZone.center}
                      radius={safeZone.radius}
                      strokeColor="rgba(255, 0, 0, 0.5)"
                      fillColor="rgba(255, 0, 0, 0.2)"
                    />
                  )}
                </MapView>
              </View>
            )}

            {/* Anlık Bilgiler */}
            {childLocation && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Anlık Bilgiler</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Enlem:</Text>
                  <Text style={styles.infoValue}>{childLocation.latitude}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Boylam:</Text>
                  <Text style={styles.infoValue}>{childLocation.longitude}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Zaman:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(childLocation.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Güvenli Alan Belirleme Butonu */}
            <View style={styles.safeZoneSection}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowSafeZoneSelector(true)}
              >
                <Text style={styles.buttonText}>Güvenli Alanı Belirle</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Güvenli Alan Seçme Ekranı */}
            <SafeZoneSelector onSave={handleSafeZoneSave} />
            {/* Kapat Butonu */}
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ef5350' }]}
                onPress={() => setShowSafeZoneSelector(false)}
              >
                <Text style={styles.buttonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 30,
    left: 10,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#64b5f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 3,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  title: {
    padding:20,
    fontSize: 26,
    fontWeight: '700',
    color: '#0d47a1',
  },
  inputContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
  },
  input: {
    height: 45,
    borderColor: '#90caf9',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#42a5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    width: width * 0.9,
    height: height * 0.4,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0d47a1',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#424242',
    width: 80,
  },
  infoValue: {
    color: '#424242',
  },
  safeZoneSection: {
    width: width * 0.9,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonContainer: {
    width: width * 0.9,
    alignItems: 'center',
    marginVertical: 10,
  },
});
