import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';

import Ilaclarim from './src/screens/Ilaclarim';
import AnaEkran from './src/screens/AnaEkran';
import TakipSistemi from './src/screens/TakipSistemi';

import Account from './src/screens/Account';
import ForgetPasswordScreen from './src/screens/AccountScreens/ForgetPasswordScreen';
import RegisterScreen from './src/screens/AccountScreens/RegisterScreen';
import LoginAccountScreen from './src/screens/AccountScreens/LoginAccountScreen';

const Tab = createBottomTabNavigator();
const AccountStack = createStackNavigator();

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

export default function App() {
  return (
    <NavigationContainer>
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
            }

            return <Icon name={iconName} size={iconSize} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 90 },
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Ana Ekran" component={AnaEkran} />
        <Tab.Screen name="İlaçlarım" component={Ilaclarim} />
        <Tab.Screen name="Takip Sistemi" component={TakipSistemi} />
        <Tab.Screen name="Profil" component={AccountStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
