import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { MachineryRental, Transaction } from '@/types/machinery';
import { 
  getUserRentals, 
  getOwnerRentals, 
  getUserTransactions, 
  getOwnerTransactions,
  updatePaymentStatus 
} from '@/services/machineryService';
import { useUser } from '@/context/UserContext';
import { Calendar, Clock, MapPin, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

interface RentalHistoryProps {
  type: 'renter' | 'owner';
}

export default function RentalHistory({ type }: RentalHistoryProps) {
  const { user } = useUser();
  const [rentals, setRentals] = useState<MachineryRental[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user, type]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (type === 'renter') {
        const userRentals = await getUserRentals(user.id);
        const userTransactions = await getUserTransactions(user.id);
        setRentals(userRentals);
        setTransactions(userTransactions);
      } else {
        const ownerRentals = await getOwnerRentals(user.id);
        const ownerTransactions = await getOwnerTransactions(user.id);
        setRentals(ownerRentals);
        setTransactions(ownerTransactions);
      }
    } catch (error) {
      console.error('Error loading rental data:', error);
      setError('Failed to load rental history');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (rentalId: string, status: MachineryRental['paymentStatus']) => {
    try {
      await updatePaymentStatus(rentalId, status);
      loadData(); // Refresh data
      Alert.alert('Success', `Payment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
      case 'failed':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'confirmed':
        return <CheckCircle size={16} color={COLORS.success} />;
      case 'pending':
        return <AlertCircle size={16} color={COLORS.warning} />;
      case 'cancelled':
      case 'failed':
        return <XCircle size={16} color={COLORS.error} />;
      default:
        return <Clock size={16} color={COLORS.textSecondary} />;
    }
  };

  const renderRentalItem = ({ item }: { item: MachineryRental }) => (
    <View style={styles.rentalCard}>
      <View style={styles.rentalHeader}>
        <Text style={styles.rentalTitle}>
          {type === 'renter' ? 'Rented' : 'Rented Out'}: Machinery
        </Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.rentalDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {item.startDate} to {item.endDate}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {item.startTime} - {item.endTime}
          </Text>
        </View>

        {item.deliveryAddress && (
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.deliveryAddress}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <CreditCard size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            ৳{item.totalAmount} ({item.paymentMethod?.toUpperCase()})
          </Text>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <View style={styles.paymentStatus}>
          <Text style={styles.paymentLabel}>Payment Status:</Text>
          <View style={styles.statusContainer}>
            {getStatusIcon(item.paymentStatus)}
            <Text style={[styles.statusText, { color: getStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
            </Text>
          </View>
        </View>

        {type === 'owner' && item.paymentStatus === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handlePaymentStatusUpdate(item.id, 'paid')}
            >
              <Text style={styles.actionButtonText}>Mark as Paid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handlePaymentStatusUpdate(item.id, 'failed')}
            >
              <Text style={styles.actionButtonText}>Mark as Failed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {item.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading rental history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'renter' ? 'My Rentals' : 'Rental Requests'}
      </Text>

      {rentals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No rentals found</Text>
          <Text style={styles.emptyDescription}>
            {type === 'renter' 
              ? 'You haven\'t rented any machinery yet'
              : 'No one has rented your machinery yet'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={rentals}
          renderItem={renderRentalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    padding: 16,
    paddingBottom: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    padding: 16,
  },
  rentalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  rentalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rentalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rentalDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  paymentSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  paymentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  confirmButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
