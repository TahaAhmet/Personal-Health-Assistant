import React from 'react';
import { FlatList } from 'react-native';
import MedicineItem from './MedicineItem';

const MedicineList = ({ medicines, deleteMedicine }) => (
  <FlatList
    data={medicines}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <MedicineItem
        name={item.name}
        time={item.time}
        id={item.id}
        deleteMedicine={deleteMedicine}
      />
    )}
  />
);

export default MedicineList;
