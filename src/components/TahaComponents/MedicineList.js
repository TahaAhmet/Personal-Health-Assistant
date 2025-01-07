import React from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MedicineItem from './MedicineItem';

const MedicineList = ({ medicines, deleteMedicine, startEditing }) => (
    <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
            <View style={styles.medicineItem}>
                <MedicineItem name={item.name} time={item.time} />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={() => startEditing(item)}
                        style={styles.editButton}
                    >
                        <Text style={styles.buttonText}>Düzenle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => deleteMedicine(item.id)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.buttonText}>Sil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
    />
);

const styles = StyleSheet.create({
    medicineItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 8,
        borderRadius: 5,
        marginRight: 5,
    },
    deleteButton: {
        backgroundColor: '#E53935',
        padding: 8,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default MedicineList;
