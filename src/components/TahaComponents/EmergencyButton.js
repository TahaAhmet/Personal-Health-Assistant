import React from 'react';
import { TouchableOpacity, Text, Alert, Linking, StyleSheet } from 'react-native';

const EmergencyButton = () => {
  const handleEmergencyCall = () => {
    Alert.alert(
      'Acil Durum Yardımı',
      '112\'yi aramak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Arama', onPress: () => Linking.openURL('tel:112') }
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity 
      style={styles.emergencyButton} 
      onPress={handleEmergencyCall}
    >
      <Text style={styles.buttonText}>Acil Durum Yardımı</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    backgroundColor: '#D32F2F',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default EmergencyButton;
