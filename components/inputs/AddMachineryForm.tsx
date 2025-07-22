import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Machinery } from '@/types/machinery';
import { addMachinery } from '@/services/machineryService';
import { useUser } from '@/context/UserContext';
import { useLocation } from '@/context/LocationContext';
// Removed picker import - using TouchableOpacity with modal instead

interface AddMachineryFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddMachineryForm({ onSuccess, onCancel }: AddMachineryFormProps) {
  const { user } = useUser();
  const { location } = useLocation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'tractor' as Machinery['type'],
    description: '',
    imageUrl: '',
    pricePerHour: '',
    pricePerDay: '',
    ownerContact: '',
    address: '',
    brand: '',
    model: '',
    year: '',
    horsepower: '',
    fuelType: 'diesel' as 'diesel' | 'petrol' | 'electric',
    condition: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add machinery');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required to add machinery');
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.description || !formData.pricePerHour || !formData.pricePerDay || !formData.ownerContact) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const machineryData: Omit<Machinery, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        imageUrl: formData.imageUrl || 'https://via.placeholder.com/300x200?text=Machinery',
        pricePerHour: parseFloat(formData.pricePerHour),
        pricePerDay: parseFloat(formData.pricePerDay),
        available: true,
        ownerId: user.id,
        ownerName: user.name,
        ownerContact: formData.ownerContact,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          address: formData.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        },
        specifications: {
          ...(formData.brand && { brand: formData.brand }),
          ...(formData.model && { model: formData.model }),
          ...(formData.year && { year: parseInt(formData.year) }),
          ...(formData.horsepower && { horsepower: parseInt(formData.horsepower) }),
          fuelType: formData.fuelType,
          condition: formData.condition,
        },
        availability: {
          startDate: formData.startDate || new Date().toISOString().split('T')[0],
          endDate: formData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          unavailableDates: [],
        },
      };

      await addMachinery(machineryData);
      Alert.alert('Success', 'Machinery added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error adding machinery:', error);
      Alert.alert('Error', 'Failed to add machinery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Add Your Machinery</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Text style={styles.label}>Machinery Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="e.g., John Deere Tractor"
        />

        <Text style={styles.label}>Type *</Text>
        <TouchableOpacity style={styles.input} onPress={() => {}}>
          <Text style={styles.inputText}>
            {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Describe your machinery, its features, and condition"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={formData.imageUrl}
          onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
          placeholder="https://example.com/image.jpg"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing</Text>
        
        <Text style={styles.label}>Price per Hour (৳) *</Text>
        <TextInput
          style={styles.input}
          value={formData.pricePerHour}
          onChangeText={(text) => setFormData({ ...formData, pricePerHour: text })}
          placeholder="500"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Price per Day (৳) *</Text>
        <TextInput
          style={styles.input}
          value={formData.pricePerDay}
          onChangeText={(text) => setFormData({ ...formData, pricePerDay: text })}
          placeholder="3000"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact & Location</Text>
        
        <Text style={styles.label}>Contact Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.ownerContact}
          onChangeText={(text) => setFormData({ ...formData, ownerContact: text })}
          placeholder="+880 1234 567890"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Your location address"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Specifications</Text>
        
        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          value={formData.brand}
          onChangeText={(text) => setFormData({ ...formData, brand: text })}
          placeholder="e.g., John Deere, Mahindra"
        />

        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={formData.model}
          onChangeText={(text) => setFormData({ ...formData, model: text })}
          placeholder="e.g., 5050D"
        />

        <Text style={styles.label}>Year</Text>
        <TextInput
          style={styles.input}
          value={formData.year}
          onChangeText={(text) => setFormData({ ...formData, year: text })}
          placeholder="2020"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Horsepower</Text>
        <TextInput
          style={styles.input}
          value={formData.horsepower}
          onChangeText={(text) => setFormData({ ...formData, horsepower: text })}
          placeholder="50"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Fuel Type</Text>
        <TouchableOpacity style={styles.input} onPress={() => {}}>
          <Text style={styles.inputText}>
            {formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1)}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Condition</Text>
        <TouchableOpacity style={styles.input} onPress={() => {}}>
          <Text style={styles.inputText}>
            {formData.condition.charAt(0).toUpperCase() + formData.condition.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        
        <Text style={styles.label}>Available From</Text>
        <TextInput
          style={styles.input}
          value={formData.startDate}
          onChangeText={(text) => setFormData({ ...formData, startDate: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>Available Until</Text>
        <TextInput
          style={styles.input}
          value={formData.endDate}
          onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Add Machinery</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.lightBackground,
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
