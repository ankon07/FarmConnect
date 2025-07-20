import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { Phone } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

const EMERGENCY_NUMBER = '01315206061';

export default function EmergencyHelpline() {
  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Helpline',
      `Do you want to call the emergency helpline?\n${EMERGENCY_NUMBER}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            const phoneUrl = `tel:${EMERGENCY_NUMBER}`;
            Linking.canOpenURL(phoneUrl)
              .then((supported) => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Error', 'Phone calls are not supported on this device');
                }
              })
              .catch((error) => {
                console.error('Error opening phone app:', error);
                Alert.alert('Error', 'Unable to open phone app');
              });
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyCall}>
      <View style={styles.buttonContent}>
        <Phone size={20} color={COLORS.white} />
        <Text style={styles.buttonText}>Emergency Helpline</Text>
      </View>
      <Text style={styles.phoneNumber}>{EMERGENCY_NUMBER}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emergencyButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  phoneNumber: {
    color: COLORS.white,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
});
