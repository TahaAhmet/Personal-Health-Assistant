import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet, Button, View } from 'react-native';
import { auth } from './firebase'; // Firebase bağlantısını kontrol edin

// ANA EKRANLARIMIZ
import HomeScreen from './src/screens/HomeScreen';
import MyMedicines from './src/screens/MyMedicines';
import TrackingSystem from './src/screens/TrackingSystem';
import ReportReminderScreen from './src/screens/ReportReminderScreen';

// ACCOUNT STACK EKRANLARI
import Account from './src/screens/Account';
import ForgetPasswordScreen from './src/screens/AccountScreens/ForgetPasswordScreen';
import RegisterScreen from './src/screens/AccountScreens/RegisterScreen';
import LoginAccountScreen from './src/screens/AccountScreens/LoginAccountScreen';

const Tab = createBottomTabNavigator();
const AccountStack  = createStackNavigator();

// **AUTH EKRANLARI**
function AccountStackScreen() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="Account" component={Account} />
      <AccountStack.Screen name="RegisterScreen" component={RegisterScreen} />
      <AccountStack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
      <AccountStack.Screen name="LoginAccountScreen" component={LoginAccountScreen} />
    </AccountStack.Navigator>
  );
}


// **BOTTOM TAB KURULUMU**
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Kullanıcı Oturum Durumu

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Kullanıcı oturum açmışsa true, aksi halde false
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        // Eğer kullanıcı giriş yaptıysa ana uygulamayı göster
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color }) => {
              let iconName;
              let iconSize = 50;

              if (route.name === 'Ana Ekran') {
                iconName = 'home';
              } else if (route.name === 'İlaçlarım') {
                iconName = 'medication';
              } else if (route.name === 'Takip Sistemi') {
                iconName = 'timeline';
              } else if (route.name === 'Profil') {
                iconName = 'account-circle';
              } else if (route.name === 'Rapor Hatırlatıcı') {
                iconName = 'alarm';
              }

              return <Icon name={iconName} size={iconSize} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { height: 90 },
            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          })}
        >
          <Tab.Screen name="Ana Ekran" component={HomeScreen} options={{ headerShown: false }} />
          <Tab.Screen name="İlaçlarım" component={MyMedicines} options={{ headerShown: false }} />
          <Tab.Screen name="Takip Sistemi" component={TrackingSystem} options={{ headerShown: false }} />
          <Tab.Screen name="Rapor Hatırlatıcı" component={ReportReminderScreen} options={{ headerShown: false }} />
          <Tab.Screen name="Profil" component={LoginAccountScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
      ) : (
        // Eğer kullanıcı giriş yapmadıysa AccountStack 'i göster
        <AccountStackScreen />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
