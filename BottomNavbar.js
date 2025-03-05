import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BottomNavBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <FontAwesome5 name="home" size={35} color="#007AFF" />
          <Text style={styles.navLabel}>Ana Sayfa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Tracking')}>
          <FontAwesome5 name="location-arrow" size={35} color="#007AFF" />
          <Text style={styles.navLabel}>Takip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Medication')}>
          <FontAwesome5 name="pills" size={35} color="#007AFF" />
          <Text style={styles.navLabel}>İlaçlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Report')}>
          <FontAwesome5 name="file-alt" size={35} color="#007AFF" />
          <Text style={styles.navLabel}>Raporlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Account')}>
          <FontAwesome5 name="user" size={35} color="#007AFF" />
          <Text style={styles.navLabel}>Hesabım</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    alignItems: 'center',
  },
  bottomNav: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    marginTop: 4,
  },
});
