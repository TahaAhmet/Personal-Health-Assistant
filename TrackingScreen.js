import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // İkon kütüphanesi
import ChildDevice from './ChildDevice';
import ParentDevice from './ParentDevice';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import BottomNavBar from './BottomNavbar';

export default function TrackingScreen({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [role, setRole] = useState(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log("Bildirim Alındı:", notification);
    });
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Kullanıcı bildirime tıkladı:", response);
    });
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleBack = () => {
    setRole(null);
  };

  if (role === 'child') {
    return <ChildDevice onBack={handleBack} />;
  }
  if (role === 'parent') {
    return <ParentDevice onBack={handleBack} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LÜTFEN ROLÜNÜZÜ SEÇİNİZ</Text>

      <TouchableOpacity 
        style={[styles.button, styles.childButton]}
        onPress={() => setRole('child')}
      >
        <Ionicons name="happy-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Çocuk Cihazı</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.parentButton]}
        onPress={() => setRole('parent')}
      >
        <Ionicons name="person-circle-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ebeveyn Cihazı</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.homeButton]}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="home-outline" size={24} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>

      <BottomNavBar />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Bildirim izni verilmedi!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    //alert("Bildirimler yalnızca fiziksel cihazlarda çalışır.");
  }
  return token;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row', // İkon ve metin yan yana olacak
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  childButton: {
    backgroundColor: '#27ae60',
  },
  parentButton: {
    backgroundColor: '#f39c12',
  },
  homeButton: {
    backgroundColor: '#e74c3c',
  },
});
