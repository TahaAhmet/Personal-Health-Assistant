import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { auth, database } from './firebase';
import { ref, get, update } from 'firebase/database';

export default function EditAccountScreen({ navigation }) {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    age: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData({
            name: data.name || '',
            surname: data.surname || '',
            age: data.age || '',
            height: data.height || '',
            weight: data.weight || '',
          });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = ref(database, 'users/' + user.uid);
        await update(userRef, userData);
        alert('Bilgiler başarıyla güncellendi!');
        navigation.goBack();
      } catch (error) {
        alert('Bilgiler güncellenirken hata oluştu: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Bilgilerimi Düzenle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>İsim:</Text>
        <TextInput
          style={styles.input}
          value={userData.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="İsminizi girin"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Soyisim:</Text>
        <TextInput
          style={styles.input}
          value={userData.surname}
          onChangeText={(text) => handleChange('surname', text)}
          placeholder="Soyisminizi girin"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Yaş:</Text>
        <TextInput
          style={styles.input}
          value={String(userData.age)}
          onChangeText={(text) => handleChange('age', text)}
          placeholder="Yaşınızı girin"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Boy (cm):</Text>
        <TextInput
          style={styles.input}
          value={String(userData.height)}
          onChangeText={(text) => handleChange('height', text)}
          placeholder="Boyunuzu girin"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kilo (kg):</Text>
        <TextInput
          style={styles.input}
          value={String(userData.weight)}
          onChangeText={(text) => handleChange('weight', text)}
          placeholder="Kilonuzu girin"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
