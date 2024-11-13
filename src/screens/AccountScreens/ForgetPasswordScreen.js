import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

export default function ForgetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Yükleniyor durumu

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }
    
    setIsLoading(true); // Yükleniyor durumu başlatılıyor

    // Firebase veya başka bir e-posta doğrulama servisi entegrasyonu
    auth.sendPasswordResetEmail(email)
      .then(() => {
        setIsLoading(false); // Yükleniyor durumu durduruluyor
        Alert.alert('Şifre Sıfırlama', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!');
        navigation.navigate('Account'); // Giriş ekranına yönlendirme
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert('Hata', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifremi Unuttum</Text>
      <Text style={styles.instructionText}>
        Şifrenizi sıfırlamak için e-posta adresinizi girin, size bir sıfırlama bağlantısı gönderelim.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" /> // Yükleniyor göstergesi
        ) : (
          <Text style={styles.buttonText}>Şifre Sıfırla</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Account')}>
        <Text style={styles.backToLoginText}>Giriş Ekranına Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToLoginText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4CAF50',
    textDecorationLine: 'underline',
  },
});
