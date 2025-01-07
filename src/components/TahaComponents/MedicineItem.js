import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const MedicineItem = ({ name, time }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.nameText}>{name}</Text>
            <Text style={styles.timeText}>Saat: {time}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 5,
    },
    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 16,
        color: '#555',
    },
});

export default MedicineItem;
