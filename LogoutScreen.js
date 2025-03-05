// LogoutScreen.js
import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LogoutScreen({ navigation }) {
  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken'); // Kullanıcı oturumunu kaldır
    navigation.replace('Login'); // Giriş ekranına yönlendir
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Çıkış Yapılıyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
  },
});
