import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

export default function Account() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate('Ana Ekran');
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleSignUp = () => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Kullanıcı ', user.email);
      })
      .catch((error) => alert(error.message));
  };

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Kullanıcı giriş yaptı', user.email);
        navigation.navigate('LoginAccountScreen'); 
      })
      .catch((error) => alert(error.message));
  };
  const toggleDarkMode = () => {
    setIsDarkMode((previousState) => !previousState);
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#121212' : '#f9f9f9' },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Sağ üst köşeye yerleştirilen Switch */}
      <View style={styles.switchContainer}>
        <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : 'white',
              color: isDarkMode ? 'white' : 'black',
            },
          ]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#b5b5b5' : '#888'}
          value={email}
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDarkMode ? '#333' : 'white',
              color: isDarkMode ? 'white' : 'black',
            },
          ]}
          placeholder="Şifre"
          placeholderTextColor={isDarkMode ? '#b5b5b5' : '#888'}
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDarkMode ? '#1e88e5' : '#0782F9' },
          ]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterScreen')}
          style={[
            styles.button,
            styles.outlineButton,
            { borderColor: isDarkMode ? '#1e88e5' : '#0782F9' },
          ]}
        >
          <Text
            style={[styles.outlineButtonText, { color: isDarkMode ? '#1e88e5' : '#0782F9' }]}
          >
            Kayıt Ol
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgetPasswordScreen')}
          style={styles.forgotPasswordButton}
        >
          <Text style={[styles.forgotPasswordText, { color: isDarkMode ? '#1e88e5' : '#0782F9' }]}>
            Şifremi Unuttum
          </Text>
        </TouchableOpacity>


      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    borderRadius: 10,
  },
  buttonContainer: {
    width: '60%',
    marginTop: 40,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    marginTop: 5,
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPasswordButton:{
    marginTop:10,
    alignItems:"center"
  },
  forgotPasswordText:{
    fontSize:14,
    fontWeight:"bold"
  }
});
