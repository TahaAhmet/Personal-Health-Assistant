import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, Dimensions, Button, KeyboardAvoidingView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { database } from '../../../firebase';
import { ref, onValue } from 'firebase/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function ParentDevice() {
  const [childLocation, setChildLocation] = useState(null);
  const [deviceUid, setDeviceUid] = useState('');
  const [currentUid, setCurrentUid] = useState(null);

  useEffect(() => {
    if (!currentUid) return; // UID mevcut değilse işlem yapma

    const locationRef = ref(database, `locations/${currentUid}`);
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setChildLocation(data);
        console.log('Çocuk cihazının konumu:', data);
      } else {
        setChildLocation(null); // Veri bulunamazsa sıfırla
      }
    });

    return () => unsubscribe(); // Dinleyiciyi temizle
  }, [currentUid]);

  const handleSetUid = () => {
    setCurrentUid(deviceUid.trim()); // Girdiyi kullan ve boşlukları temizle
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <LinearGradient colors={['#e3f2fd', '#90caf9']} style={styles.container}>
        <Text style={styles.title}>Çocuk Cihazının Konumu</Text>

        {/* UID Giriş Alanı */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Cihaz UID'sini girin"
            value={deviceUid}
            onChangeText={setDeviceUid}
          />
          <Button title="Göster" onPress={handleSetUid} />
        </View>

        {/* Harita ve Bilgiler */}
        {childLocation ? (
          <>
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
              </MapView>
            </View>
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
          </>
        ) : (
          <Text style={styles.errorText}>
            {currentUid ? 'Konum bilgisi alınamıyor...' : 'Lütfen cihaz UID\'sini girin.'}
          </Text>
        )}
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#0d47a1',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  mapContainer: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height * 0.5,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    width: Dimensions.get('window').width * 0.9,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555555',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});
