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
import { Calendar, Clock, AlertTriangle, FileText, Leaf } from 'lucide-react-native';

const TASK_TYPES = [
  'planting',
  'watering',
  'fertilizing',
  'pest_control',
  'weeding',
  'harvesting',
  'soil_preparation',
  'equipment_maintenance',
  'other'
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: colors.success },
  { value: 'medium', label: 'Medium', color: colors.primary },
  { value: 'high', label: 'High', color: colors.warning },
  { value: 'urgent', label: 'Urgent', color: colors.error },
];

export default function AddTaskScreen() {
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { createMaintenanceTask, activeCrops } = useScheduling();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'other',
    priority: 'medium',
    scheduledDate: new Date(),
    estimatedDuration: '',
    cropScheduleId: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType as any,
        priority: formData.priority as any,
        scheduledDate: formData.scheduledDate,
        estimatedDuration: parseFloat(formData.estimatedDuration) || 1,
        status: 'pending',
      };

      // Only add optional fields if they have valid values
      if (formData.cropScheduleId && formData.cropScheduleId.trim()) {
        taskData.cropScheduleId = formData.cropScheduleId;
      }
      
      if (formData.notes && formData.notes.trim()) {
        taskData.notes = formData.notes.trim();
      }

      await createMaintenanceTask(taskData);

      Alert.alert('Success', 'Task created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={translate('Add Task')} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <FileText size={20} color={colors.primary} /> {translate('Task Information')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Task Title')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder={translate('Enter task title')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Description')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder={translate('Describe what needs to be done')}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Task Type')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeContainer}>
              {TASK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.taskType === type && styles.selectedTypeButton
                  ]}
                  onPress={() => updateFormData('taskType', type)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.taskType === type && styles.selectedTypeButtonText
                  ]}>
                    {translate(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <AlertTriangle size={20} color={colors.primary} /> {translate('Priority & Schedule')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Priority Level')}</Text>
            <View style={styles.priorityContainer}>
              {PRIORITY_LEVELS.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityButton,
                    { borderColor: priority.color },
                    formData.priority === priority.value && { backgroundColor: priority.color }
                  ]}
                  onPress={() => updateFormData('priority', priority.value)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    formData.priority === priority.value && styles.selectedPriorityButtonText
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Scheduled Date')} *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => {
                Alert.alert('Date Picker', 'Date picker would open here');
              }}
            >
              <Text style={styles.dateText}>
                {formData.scheduledDate.toLocaleDateString()}
              </Text>
              <Calendar size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Estimated Duration (hours)')}</Text>
            <TextInput
              style={styles.input}
              value={formData.estimatedDuration}
              onChangeText={(value) => updateFormData('estimatedDuration', value)}
              placeholder={translate('Enter estimated hours')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Leaf size={20} color={colors.primary} /> {translate('Related Crop')}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('Associated Crop (Optional)')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropContainer}>
              <TouchableOpacity
                style={[
                  styles.cropButton,
                  !formData.cropScheduleId && styles.selectedCropButton
                ]}
                onPress={() => updateFormData('cropScheduleId', '')}
              >
                <Text style={[
                  styles.cropButtonText,
                  !formData.cropScheduleId && styles.selectedCropButtonText
                ]}>
                  {translate('No Crop')}
                </Text>
              </TouchableOpacity>
              {activeCrops.map((crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.cropButton,
                    formData.cropScheduleId === crop.id && styles.selectedCropButton
                  ]}
                  onPress={() => updateFormData('cropScheduleId', crop.id)}
                >
                  <Text style={[
                    styles.cropButtonText,
                    formData.cropScheduleId === crop.id && styles.selectedCropButtonText
                  ]}>
                    {crop.cropName} - {crop.fieldLocation}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
            title={translate('Create Task')}
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
    height: 80,
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
  typeContainer: {
    flexDirection: 'row',
  },
  typeButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedTypeButtonText: {
    color: colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  selectedPriorityButtonText: {
    color: colors.white,
  },
  cropContainer: {
    flexDirection: 'row',
  },
  cropButton: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCropButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectedCropButtonText: {
    color: colors.white,
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
