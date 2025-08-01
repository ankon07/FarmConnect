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
  Switch,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Machinery, RentalFormData } from '@/types/machinery';
import { createRental } from '@/services/machineryService';
import { useUser } from '@/context/UserContext';
import { useTranslation } from '@/hooks/useTranslation';

interface MachineryRentalFormProps {
  machinery: Machinery;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MachineryRentalForm({ machinery, onSuccess, onCancel }: MachineryRentalFormProps) {
  const { user } = useUser();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<RentalFormData>({
    startDate: '',
    endDate: '',
    startTime: '08:00',
    endTime: '17:00',
    notes: '',
    deliveryAddress: '',
    requiresDelivery: false,
    paymentMethod: 'bkash',
    paymentInfo: {
      method: 'bkash',
      phoneNumber: '',
    },
  });

  const calculateCost = () => {
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      return { totalHours: 0, totalDays: 0, totalAmount: 0, deliveryFee: 0 };
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    const totalHours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));
    const totalDays = Math.ceil(totalHours / 24);
    
    let totalAmount = 0;
    if (totalHours <= 8) {
      totalAmount = totalHours * machinery.pricePerHour;
    } else {
      totalAmount = totalDays * machinery.pricePerDay;
    }
    
    const deliveryFee = formData.requiresDelivery ? 500 : 0;
    
    return { totalHours, totalDays, totalAmount, deliveryFee };
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(t('error'), t('please-login-rent'));
      return;
    }

    // Validate required fields
    if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
      Alert.alert(t('error'), t('fill-required-fields'));
      return;
    }

    // Validate dates
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    const now = new Date();

    if (startDateTime < now) {
      Alert.alert(t('error'), t('start-date-past'));
      return;
    }

    if (endDateTime <= startDateTime) {
      Alert.alert(t('error'), t('end-date-after'));
      return;
    }

    if (formData.requiresDelivery && !formData.deliveryAddress) {
      Alert.alert(t('error'), t('provide-delivery-address'));
      return;
    }

    // Validate payment information
    if (formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad' || formData.paymentMethod === 'rocket') {
      if (!formData.paymentInfo.phoneNumber) {
        Alert.alert(t('error'), t('provide-mobile-payment'));
        return;
      }
    }

    if (formData.paymentMethod === 'bank_transfer' && !formData.paymentInfo.accountNumber) {
      Alert.alert(t('error'), t('provide-bank-account'));
      return;
    }

    setLoading(true);
    try {
      await createRental(machinery.id, user.id, formData, user.name);
      Alert.alert(t('success'), t('rental-request-success'));
      onSuccess();
    } catch (error) {
      console.error('Error creating rental:', error);
      Alert.alert(t('error'), t('failed-submit-rental'));
    } finally {
      setLoading(false);
    }
  };

  const cost = calculateCost();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t('rent')} {machinery.name}</Text>
      
      <View style={styles.machineryInfo}>
        <Text style={styles.machineryName}>{machinery.name}</Text>
        <Text style={styles.machineryDetails}>{t('owner')}: {machinery.ownerName}</Text>
        <Text style={styles.machineryDetails}>{t('contact')}: {machinery.ownerContact}</Text>
        <Text style={styles.machineryDetails}>{t('location')}: {machinery.location.address}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>৳{machinery.pricePerHour}/hour</Text>
          <Text style={styles.priceText}>৳{machinery.pricePerDay}/day</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('rental-period')}</Text>
        
        <Text style={styles.label}>{t('start-date')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.startDate}
          onChangeText={(text) => setFormData({ ...formData, startDate: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>{t('start-time')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.startTime}
          onChangeText={(text) => setFormData({ ...formData, startTime: text })}
          placeholder="HH:MM (24-hour format)"
        />

        <Text style={styles.label}>{t('end-date')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.endDate}
          onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>{t('end-time')} *</Text>
        <TextInput
          style={styles.input}
          value={formData.endTime}
          onChangeText={(text) => setFormData({ ...formData, endTime: text })}
          placeholder="HH:MM (24-hour format)"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('delivery-options')}</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>{t('require-delivery')}</Text>
          <Switch
            value={formData.requiresDelivery}
            onValueChange={(value) => setFormData({ ...formData, requiresDelivery: value })}
            trackColor={{ false: COLORS.lightBackground, true: COLORS.primary }}
            thumbColor={formData.requiresDelivery ? COLORS.white : COLORS.textSecondary}
          />
        </View>

        {formData.requiresDelivery && (
          <>
            <Text style={styles.label}>{t('delivery-address')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.deliveryAddress}
              onChangeText={(text) => setFormData({ ...formData, deliveryAddress: text })}
              placeholder={t('enter-delivery-address')}
              multiline
              numberOfLines={3}
            />
            <Text style={styles.deliveryNote}>{t('delivery-fee')}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('payment-method')}</Text>
        
        <View style={styles.paymentMethodContainer}>
          {['bkash', 'nagad', 'rocket', 'bank_transfer', 'cash'].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentMethodButton,
                formData.paymentMethod === method && styles.selectedPaymentMethod
              ]}
              onPress={() => setFormData({ 
                ...formData, 
                paymentMethod: method as any,
                paymentInfo: { 
                  method: method as any,
                  phoneNumber: method === 'cash' || method === 'bank_transfer' ? undefined : '',
                  accountNumber: method === 'bank_transfer' ? '' : undefined,
                }
              })}
            >
              <Text style={[
                styles.paymentMethodText,
                formData.paymentMethod === method && styles.selectedPaymentMethodText
              ]}>
                {method === 'bkash' ? t('bkash') :
                 method === 'nagad' ? t('nagad') :
                 method === 'rocket' ? t('rocket') :
                 method === 'bank_transfer' ? t('bank-transfer') :
                 t('cash-on-delivery')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {(formData.paymentMethod === 'bkash' || formData.paymentMethod === 'nagad' || formData.paymentMethod === 'rocket') && (
          <>
            <Text style={styles.label}>{t('mobile-number')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.paymentInfo.phoneNumber || ''}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                paymentInfo: { ...formData.paymentInfo, phoneNumber: text }
              })}
              placeholder="+880 1234 567890"
              keyboardType="phone-pad"
            />
          </>
        )}

        {formData.paymentMethod === 'bank_transfer' && (
          <>
            <Text style={styles.label}>{t('account-number')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.paymentInfo.accountNumber || ''}
              onChangeText={(text) => setFormData({ 
                ...formData, 
                paymentInfo: { ...formData.paymentInfo, accountNumber: text }
              })}
              placeholder={t('enter-bank-account')}
              keyboardType="numeric"
            />
          </>
        )}

        {formData.paymentMethod === 'cash' && (
          <Text style={styles.paymentNote}>
            {t('cash-payment-note')}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('additional-notes')}</Text>
        
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder={t('special-requirements')}
          multiline
          numberOfLines={4}
        />
      </View>

      {cost.totalAmount > 0 && (
        <View style={styles.costSummary}>
          <Text style={styles.costTitle}>{t('cost-summary')}</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t('duration')}:</Text>
            <Text style={styles.costValue}>
              {cost.totalHours} {t('hours')} ({cost.totalDays} {t('days')})
            </Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>{t('rental-cost')}:</Text>
            <Text style={styles.costValue}>৳{cost.totalAmount}</Text>
          </View>
          {formData.requiresDelivery && (
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Delivery Fee:</Text>
              <Text style={styles.costValue}>৳{cost.deliveryFee}</Text>
            </View>
          )}
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('total-amount')}:</Text>
            <Text style={styles.totalValue}>৳{cost.totalAmount + cost.deliveryFee}</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>{t('submit-request')}</Text>
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
  machineryInfo: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  machineryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  machineryDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
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
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  deliveryNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: -8,
    marginBottom: 16,
  },
  costSummary: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  costTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  costValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
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
  paymentMethodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  paymentMethodButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPaymentMethod: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentMethodText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  selectedPaymentMethodText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  paymentNote: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
  },
});
