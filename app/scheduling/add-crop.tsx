import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useScheduling } from '../../context/SchedulingContext';
import { useTranslation } from '../../hooks/useTranslation';
import { COLORS as colors } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import PrimaryButton from '../../components/common/PrimaryButton';
import { Calendar, MapPin, Leaf, FileText } from 'lucide-react-native';

export default function AddCropScreen() {
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { createCropSchedule } = useScheduling();

  const [formData, setFormData] = useState({
    cropName: '',
    variety: '',
    fieldLocation: '',
    fieldSize: '',
    plantingDate: new Date(),
    harvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.cropName || !formData.fieldLocation || !formData.fieldSize) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const cropData: any = {
        cropName: formData.cropName,
        fieldLocation: formData.fieldLocation,
        fieldSize: parseFloat(formData.fieldSize),
        plantingDate: formData.plantingDate,
        harvestDate: formData.harvestDate,
        status: 'planned',
      };

      // Only add optional fields if they have valid values
      if (formData.variety && formData.variety.trim()) {
        cropData.variety = formData.variety.trim();
      }
      
      if (formData.notes && formData.notes.trim()) {
        cropData.notes = formData.notes.trim();
      }

      await createCropSchedule(cropData);

      Alert.alert('Success', 'Crop schedule created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating crop schedule:', error);
      Alert.alert('Error', 'Failed to create crop schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={translate('Add Crop Schedule')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Leaf size={20} color={colors.primary} /> {translate('Crop Information')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Crop Name')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.cropName}
              onChangeText={(value) => updateFormData('cropName', value)}
              placeholder={translate('Enter crop name (e.g., Rice, Wheat)')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Variety')}</Text>
            <TextInput
              style={styles.input}
              value={formData.variety}
              onChangeText={(value) => updateFormData('variety', value)}
              placeholder={translate('Enter variety (optional)')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MapPin size={20} color={colors.primary} /> {translate('Field Information')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Field Location')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.fieldLocation}
              onChangeText={(value) => updateFormData('fieldLocation', value)}
              placeholder={translate('Enter field location')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Field Size (acres)')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.fieldSize}
              onChangeText={(value) => updateFormData('fieldSize', value)}
              placeholder={translate('Enter field size in acres')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Calendar size={20} color={colors.primary} /> {translate('Schedule')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Planting Date')} *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                // For now, just show an alert. In a real app, you'd show a date picker
                Alert.alert('Date Picker', 'Date picker would open here');
              }}
            >
              <Text style={styles.dateText}>
                {formData.plantingDate.toLocaleDateString()}
              </Text>
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Expected Harvest Date')} *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                Alert.alert('Date Picker', 'Date picker would open here');
              }}
            >
              <Text style={styles.dateText}>
                {formData.harvestDate.toLocaleDateString()}
              </Text>
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FileText size={20} color={colors.primary} /> {translate('Additional Notes')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Notes')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              placeholder={translate('Enter any additional notes or instructions')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>{translate('Cancel')}</Text>
          </TouchableOpacity>

          <PrimaryButton
            title={translate('Create Crop Schedule')}
            onPress={handleSubmit}
            isLoading={isLoading}
            variant="primary"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  textArea: {
    height: 100,
  },
  dateInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
  },
});
