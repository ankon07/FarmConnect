import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { Merchandise } from '../components/merchandise/Merchandise';
import { COLORS } from '../constants/colors';

export default function MerchandiseScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'ব্যবসা-বাণিজ্য সেবা',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Merchandise />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
