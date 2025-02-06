import React, { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import ChildDevice from './TrackingSystemScreens/ChildDevice'; 
import ParentDevice from './TrackingSystemScreens/ParentDevice'; 

export default function TrackingSystem() {
  const [role, setRole] = useState(null); 

  if (role === 'child') {
    return <ChildDevice />; 
  }

  if (role === 'parent') {
    return <ParentDevice />; 
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lütfen Rolünüzü Seçin</Text>
      <Button title="Çocuk Cihazı" onPress={() => setRole('child')} />
      <View style={{ margin: 10 }} />
      <Button title="Ebeveyn Cihazı" onPress={() => setRole('parent')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
