import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import TrackingScreen from './TrackingScreen';
import LogoutScreen from './LogoutScreen';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import MedicineScreen from './MedicineScreen';
import ReportScreen from './ReportScreen';
import AccountScreen from './AccountScreen';
import EditAccountScreen from './EditAccountScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    // 📌 Bildirim izni istemeyi buraya aldık
    async function requestNotificationPermission() {
      await Notifications.requestPermissionsAsync();
    }
    
    requestNotificationPermission();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap', headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kayıt Ol' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
        <Stack.Screen name="Medication" component={MedicineScreen} options={{ title: 'İlaç Takip' }} />
        <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: 'Takip Sayfası' }} />
        <Stack.Screen name="Report" component={ReportScreen} options={{ title: 'Raporlarım' }} />
        <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Hesabım' }} />
        <Stack.Screen name="EditAccount" component={EditAccountScreen} options={{ title: 'Hesabımı Düzenle' }} />
        <Stack.Screen name="Logout" component={LogoutScreen} options={{ title: 'Çıkış Yap' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
