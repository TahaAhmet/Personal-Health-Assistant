//SafeZoneSelector.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';

export default function SafeZoneSelector({ onSave, childLocation }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radius, setRadius] = useState(200); // Varsayılan yarıçap (200 metre)
  const [isZoneSelected, setIsZoneSelected] = useState(false); // Alan belirlendi mi?

  // Haritaya uzun basınca seçilen koordinatı kaydet
  const handleLongPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    setIsZoneSelected(false); // Kullanıcı tekrar bir nokta seçerse, önceki alanı iptal et
  };

  // Kullanıcının seçtiği alanı doğrula
  const handleConfirmZone = () => {
    if (!selectedLocation) {
      Alert.alert("Hata", "Lütfen haritaya uzun basarak bir nokta seçin.");
      return;
    }
    setIsZoneSelected(true);
  };

  // Güvenli alanı kaydetme işlemi
  const handleSave = () => {
    if (!selectedLocation) {
      Alert.alert("Hata", "Güvenli alanı belirlemeden kaydedemezsiniz!");
      return;
    }

    const safeZone = {
      center: selectedLocation,
      radius,
    };

    onSave(safeZone); // Firebase'e kaydetmek için üst bileşene gönder
  };

  return (
    <View style={styles.container}>
      {/* Harita Bölümü */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          onLongPress={handleLongPress}
          initialRegion={{
            latitude: 38.1883179,
            longitude: 27.1864963,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Eğer üst bileşenden çocuk cihaz konumu geldiyse marker göster */}
          {childLocation && (
            <Marker
              coordinate={childLocation}
              title="Çocuk Cihazı"
              pinColor="green"
            />
          )}
          {selectedLocation && (
            <>
              <Marker 
                coordinate={selectedLocation} 
                title="Güvenli Alan Merkezi" 
              />
              <Circle
                center={selectedLocation}
                radius={radius}
                strokeColor="rgba(0, 122, 255, 0.5)"
                fillColor="rgba(0, 122, 255, 0.2)"
              />
            </>
          )}
        </MapView>
      </View>

      {/* Alt Bilgi Bölümü */}
      <LinearGradient 
        colors={['#fff', '#e3f2fd']} 
        style={styles.bottomContainer}
      >
        <Text style={styles.label}>Yarıçap: {radius} m</Text>
        <Slider
          style={styles.slider}
          minimumValue={50}
          maximumValue={500}
          step={10}
          value={radius}
          onValueChange={(value) => setRadius(value)}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007AFF"
          disabled={!selectedLocation} // Eğer nokta seçilmemişse kaydırıcı pasif olsun
        />

        {/* Güvenli Alan Belirleme Butonu */}
        <TouchableOpacity style={styles.button} onPress={handleConfirmZone}>
          <Text style={styles.buttonText}>GÜVENLİ ALANI BELİRLE</Text>
        </TouchableOpacity>

        {/* Güvenli Alanı Kaydet Butonu */}
        <TouchableOpacity 
          style={[styles.button, !isZoneSelected && styles.buttonDisabled]} 
          onPress={handleSave} 
          disabled={!isZoneSelected}
        >
          <Text style={styles.buttonText}>GÜVENLİ ALANI KAYDET</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    maxHeight: height * 0.5, // Ekranın %50'si kadar yüksek
    borderRadius: 15,      // Köşeleri yuvarlatmak için
    overflow: 'hidden',    // Yuvarlatılmış köşelerin dışına taşmaması için
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10, // Gölgelendirme efekti
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
    color: '#424242',
  },
  slider: {
    width: width * 0.8,
    height: 40,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    width: width * 0.8,
    alignItems: 'center',
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#90caf9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
