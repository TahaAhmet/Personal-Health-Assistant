import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './BottomNavbar';

export default function AccountScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    age: '',
    height: '',
    weight: '',
  });

  // Kullanıcı verilerini realtime olarak dinleyen fonksiyon
  const subscribeUserData = () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, 'users/' + user.uid);
      return onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData({
            name: capitalizeFirstLetter(data.name),
            surname: capitalizeFirstLetter(data.surname),
            age: data.age,
            height: data.height,
            weight: data.weight,
          });
        }
      });
    }
  };

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = subscribeUserData();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  // İlk harfi büyük yapma fonksiyonu
  const capitalizeFirstLetter = (str) => {
    return str
      ? str
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : '';
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace('Login');
  };

  return (
    <View style={styles.fullContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Hesabım</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <FontAwesome5 name="user" size={24} color="#007AFF" />
            <Text style={styles.infoText}>İsim</Text>
            <Text style={styles.infoValue}>{userData.name}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="user-tag" size={24} color="#007AFF" />
            <Text style={styles.infoText}>Soyisim</Text>
            <Text style={styles.infoValue}>{userData.surname}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="birthday-cake" size={24} color="#FF5722" />
            <Text style={styles.infoText}>Yaş</Text>
            <Text style={styles.infoValue}>{userData.age}</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="ruler-vertical" size={24} color="#4CAF50" />
            <Text style={styles.infoText}>Boy</Text>
            <Text style={styles.infoValue}>{userData.height} cm</Text>
          </View>
          <View style={styles.infoBox}>
            <FontAwesome5 name="weight" size={24} color="#FF5722" />
            <Text style={styles.infoText}>Kilo</Text>
            <Text style={styles.infoValue}>{userData.weight} kg</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditAccount')}
        >
          <Text style={styles.buttonText}>Bilgilerimi Düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Alt navigasyon bileşeni */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 100, // Alt navigasyon menüsü için ekstra boşluk
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoBox: {
    backgroundColor: '#fff',
    width: '45%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
