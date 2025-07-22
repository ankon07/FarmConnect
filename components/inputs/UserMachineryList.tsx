import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Machinery } from '@/types/machinery';
import { getUserMachinery, deleteMachinery, updateMachinery } from '@/services/machineryService';
import { useUser } from '@/context/UserContext';
import RentalHistory from './RentalHistory';
import TabView from '@/components/common/TabView';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react-native';

interface UserMachineryListProps {
  onAddNew: () => void;
  refreshTrigger?: number;
}

export default function UserMachineryList({ onAddNew, refreshTrigger }: UserMachineryListProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("My Machinery");
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "My Machinery") {
      loadUserMachinery();
    }
  }, [user, refreshTrigger, activeTab]);

  const loadUserMachinery = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userMachinery = await getUserMachinery(user.id);
      setMachinery(userMachinery);
    } catch (error) {
      console.error('Error loading user machinery:', error);
      setError('Failed to load your machinery');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (machineryId: string, currentAvailability: boolean) => {
    try {
      await updateMachinery(machineryId, { available: !currentAvailability });
      setMachinery(prev => 
        prev.map(item => 
          item.id === machineryId 
            ? { ...item, available: !currentAvailability }
            : item
        )
      );
      Alert.alert(
        'Success', 
        `Machinery ${!currentAvailability ? 'made available' : 'made unavailable'} for rent`
      );
    } catch (error) {
      console.error('Error updating machinery availability:', error);
      Alert.alert('Error', 'Failed to update machinery availability');
    }
  };

  const handleDelete = (machineryId: string, machineryName: string) => {
    Alert.alert(
      'Delete Machinery',
      `Are you sure you want to delete "${machineryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMachinery(machineryId);
              setMachinery(prev => prev.filter(item => item.id !== machineryId));
              Alert.alert('Success', 'Machinery deleted successfully');
            } catch (error) {
              console.error('Error deleting machinery:', error);
              Alert.alert('Error', 'Failed to delete machinery');
            }
          },
        },
      ]
    );
  };

  const renderMachineryItem = ({ item }: { item: Machinery }) => (
    <View style={styles.machineryCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.machineryImage} />
      
      <View style={styles.machineryInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.machineryName}>{item.name}</Text>
          <View style={[styles.statusBadge, item.available ? styles.availableBadge : styles.unavailableBadge]}>
            <Text style={[styles.statusText, item.available ? styles.availableText : styles.unavailableText]}>
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.machineryType}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
        <Text style={styles.machineryDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.priceText}>৳{item.pricePerHour}/hr</Text>
          <Text style={styles.priceText}>৳{item.pricePerDay}/day</Text>
        </View>
        
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleAvailability(item.id, item.available)}
          >
            {item.available ? (
              <EyeOff size={16} color={COLORS.white} />
            ) : (
              <Eye size={16} color={COLORS.white} />
            )}
            <Text style={styles.actionButtonText}>
              {item.available ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => {
              // TODO: Implement edit functionality
              Alert.alert('Coming Soon', 'Edit functionality will be available soon');
            }}
          >
            <Edit size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Trash2 size={16} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your machinery...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserMachinery}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tabs = ["My Machinery", "Rental Requests"];

  return (
    <View style={styles.container}>
      <TabView
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {activeTab === "My Machinery" && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Your Machinery</Text>
            <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
              <Text style={styles.addButtonText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {machinery.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No machinery listed yet</Text>
              <Text style={styles.emptyDescription}>
                Start earning by listing your agricultural machinery for rent
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={onAddNew}>
                <Text style={styles.emptyButtonText}>Add Your First Machinery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={machinery}
              renderItem={renderMachineryItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {activeTab === "Rental Requests" && (
        <RentalHistory type="owner" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  machineryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  machineryImage: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.lightBackground,
  },
  machineryInfo: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  machineryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: COLORS.success + '20',
  },
  unavailableBadge: {
    backgroundColor: COLORS.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  availableText: {
    color: COLORS.success,
  },
  unavailableText: {
    color: COLORS.error,
  },
  machineryType: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  machineryDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  toggleButton: {
    backgroundColor: COLORS.primary,
  },
  editButton: {
    backgroundColor: COLORS.warning,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
