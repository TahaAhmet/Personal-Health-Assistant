import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking 
} from 'react-native';
import { auth, database } from './firebase';
import { ref, onValue } from 'firebase/database';
import { FontAwesome5 } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './BottomNavbar';

export default function HomeScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    age: '',
    height: '',
    weight: '',
  });
  const [advice, setAdvice] = useState('');

  const healthAdvices = [
    "Günde en az 2 litre su içmeyi unutmayın! 💧",
    "Düzenli olarak egzersiz yaparak sağlığınızı koruyun! 🏃‍♂️",
    "Her gün en az 7-8 saat uyumaya özen gösterin. 😴",
    "Sebze ve meyve tüketimini artırın, bağışıklığınızı güçlendirin! 🍏🥕",
    "Güneş ışığı almak D vitamini seviyeniz için önemlidir! ☀️",
    "Telefon ve bilgisayar ekranlarından uzak durarak göz sağlığınızı koruyun! 👀",
    "Günlük en az 10 dakika meditasyon yaparak stresi azaltın! 🧘",
    "Şeker ve işlenmiş gıdalardan kaçınarak daha sağlıklı beslenin! 🍫🚫",
  ];

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

  useFocusEffect(
    useCallback(() => {
      const randomAdvice = healthAdvices[Math.floor(Math.random() * healthAdvices.length)];
      setAdvice(randomAdvice);
    }, [])
  );

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

  const handleEmergencyCall = () => {
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Hoşgeldin, {userData.name} {userData.surname}!</Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <FontAwesome5 name="user" size={24} color="#007AFF" />
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

      <View style={styles.adviceContainer}>
        <Text style={styles.adviceTitle}>Günün Sağlık Tavsiyesi</Text>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>

      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
        <FontAwesome5 name="exclamation-triangle" size={30} color="#fff" style={styles.icon} />
        <Text style={styles.emergencyButtonText}>Acil Durum: 112'yi Ara</Text>
      </TouchableOpacity>

      {/* Alt Navigasyon Menüsü Component */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#fff',
    width: 130,
    height: 130,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  adviceContainer: {
    backgroundColor: '#E8F6EF',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  adviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 10,
  },
  adviceText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  emergencyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E74C3C',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
  logoutButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
