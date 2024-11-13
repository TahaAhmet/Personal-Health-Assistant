import { StyleSheet, Text, View, TouchableOpacity, Alert, Image } from 'react-native';
import React from 'react';
import { auth } from '../../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginAccountScreen() {
  const navigation = useNavigation();
  const user = auth.currentUser;

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Alert.alert("Çıkış Yapıldı", "Başarıyla çıkış yaptınız.");
        navigation.navigate('Account'); // Çıkıştan sonra Account ekranına yönlendirme
      })
      .catch((error) => alert(error.message));
  };

  return (
    <View style={styles.container}>
      {/* Üst Kısım Profili Gösterimi */}
      <View style={styles.profileContainer}>
        <Image
          style={styles.profileImage}
          source={{ uri: 'https://via.placeholder.com/150' }} // Profil resmi için placeholder
        />
        <Text style={styles.nameText}>{user?.displayName || 'Ad Soyad Bilinmiyor'}</Text>
        <Text style={styles.emailText}>{user?.email || 'E-posta Bilinmiyor'}</Text>
      </View>
      
      {/* Bilgi Kartı */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Hesap Bilgileri</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Ad Soyad:</Text>
          <Text style={styles.infoValue}>{user?.displayName || 'Bilinmiyor'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>E-posta:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Bilinmiyor'}</Text>
        </View>
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    alignItems: 'center',
    padding: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#1e88e5',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    width: '90%',
    borderRadius: 15,
    padding: 20,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  infoLabel: {
    fontSize: 16,
    color: '#888',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
