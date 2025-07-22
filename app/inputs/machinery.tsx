import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Modal } from "react-native";
import { getEquipmentList } from "@/services/api";
import { getAvailableMachinery } from "@/services/machineryService";
import AppHeader from "@/components/common/AppHeader";
import EquipmentListItem from "@/components/inputs/EquipmentListItem";
import MachineryMap from "@/components/inputs/MachineryMap";
import MachineryQuickInfoBanner from "@/components/inputs/MachineryQuickInfoBanner";
import UserMachineryList from "@/components/inputs/UserMachineryList";
import AddMachineryForm from "@/components/inputs/AddMachineryForm";
import MachineryRentalForm from "@/components/inputs/MachineryRentalForm";
import RentalHistory from "@/components/inputs/RentalHistory";
import TabView from "@/components/common/TabView";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { useUser } from "@/context/UserContext";
import { Machinery } from "@/types/machinery";
import { MapPin, List, LocateFixed, AlertCircle } from "lucide-react-native";
import { useTranslation } from "@/hooks/useTranslation";

interface Equipment {
  id: string;
  name: string;
  available: boolean;
  distance: string;
  imageUrl: string;
  price: string;
  latitude?: number;
  longitude?: number;
}

export default function MachineryScreen() {
  const { 
    location, 
    userLocation, 
    hasLocationPermission, 
    requestLocationPermission, 
    getCurrentLocation,
    isLoading: locationLoading,
    error: locationError 
  } = useLocation();
  const { user } = useUser();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("browse-machinery");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [availableMachinery, setAvailableMachinery] = useState<Machinery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachinery, setSelectedMachinery] = useState<Equipment | null>(null);
  const [selectedMachineryForRent, setSelectedMachineryForRent] = useState<Machinery | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (activeTab === "browse-machinery") {
      loadEquipment();
      loadAvailableMachinery();
    }
  }, [location, activeTab]);

  useEffect(() => {
    // Show location error if any
    if (locationError) {
      setError(locationError);
    }
  }, [locationError]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const loadEquipment = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEquipmentList({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (response.success) {
        // Process equipment with proper coordinates and distance calculation
        const equipmentWithCoords = response.data.map((item: Equipment, index: number) => {
          // Use actual coordinates if available, otherwise generate realistic nearby coordinates
          const equipmentLat = item.latitude || (location.latitude + (Math.random() - 0.5) * 0.1); // Within ~5km radius
          const equipmentLon = item.longitude || (location.longitude + (Math.random() - 0.5) * 0.1);
          
          // Calculate actual distance
          const distance = calculateDistance(location.latitude, location.longitude, equipmentLat, equipmentLon);
          
          return {
            ...item,
            latitude: equipmentLat,
            longitude: equipmentLon,
            distance: `${distance}`, // Update distance with calculated value
          };
        });
        setEquipment(equipmentWithCoords);
      } else {
        setError("Failed to load equipment information");
      }
    } catch (error) {
      console.error("Error loading equipment:", error);
      setError("An error occurred while loading equipment information");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMachinery = async () => {
    if (!location) return;
    
    try {
      const machinery = await getAvailableMachinery(location.latitude, location.longitude);
      
      // Calculate distances for user-added machinery
      const machineryWithDistance = machinery.map(item => {
        const distance = calculateDistance(
          location.latitude, 
          location.longitude, 
          item.location.latitude, 
          item.location.longitude
        );
        return {
          ...item,
          location: {
            ...item.location,
            address: item.location.address === `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}` 
              ? `${distance} km away` 
              : `${item.location.address} (${distance} km away)`
          }
        };
      });
      
      setAvailableMachinery(machineryWithDistance);
    } catch (error) {
      console.error("Error loading available machinery:", error);
    }
  };

  const handleLocateUser = async () => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
      Alert.alert(
        t('location-permission-required'),
        t('enable-location-access'),
        [{ text: t('ok', 'OK') }]
      );
        return;
      }
    }

    if (userLocation) {
      // This will trigger the useEffect in MachineryMap to update the map view
      console.log("Centering map on user location:", userLocation);
      // Force refresh current location
      await getCurrentLocation();
    } else {
      // Try to get current location
      const currentLoc = await getCurrentLocation();
      if (!currentLoc) {
      Alert.alert(
        t('location-unavailable'),
        t('unable-get-location'),
        [{ text: t('ok', 'OK') }]
      );
      }
    }
  };

  const handleReserve = (equipmentId: string) => {
    // Check if user is logged in
    if (!user) {
      Alert.alert(
        t('login-required'),
        t('please-login-rent'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => {
            // Navigate to login - you might want to implement navigation here
            console.log('Navigate to login');
          }}
        ]
      );
      return;
    }

    // Find machinery in available machinery list (new system)
    const machinery = availableMachinery.find(m => m.id === equipmentId);
    if (machinery) {
      // Check if user is trying to rent their own machinery
      if (machinery.ownerId === user.id) {
        Alert.alert(t('error'), t('cannot-rent-own'));
        return;
      }
      
      setSelectedMachineryForRent(machinery);
      setShowRentalForm(true);
    } else {
      // Fallback for old equipment system - convert to machinery format
      const foundEquipment = equipment.find((e: Equipment) => e.id === equipmentId);
      if (foundEquipment) {
        // Create a temporary machinery object for old equipment
        const tempMachinery: Machinery = {
          id: foundEquipment.id,
          name: foundEquipment.name,
          type: 'other',
          description: 'Legacy equipment from external API',
          imageUrl: foundEquipment.imageUrl,
          pricePerHour: 500, // Default price
          pricePerDay: 3000, // Default price
          available: foundEquipment.available,
          ownerId: 'external',
          ownerName: 'External Provider',
          ownerContact: 'Contact through app',
          location: {
            latitude: foundEquipment.latitude || 0,
            longitude: foundEquipment.longitude || 0,
            address: foundEquipment.distance,
          },
          specifications: {
            condition: 'good',
          },
          availability: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            unavailableDates: [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setSelectedMachineryForRent(tempMachinery);
        setShowRentalForm(true);
      } else {
        Alert.alert(t('error'), t('machinery-not-found'));
      }
    }
  };

  const handleAddMachinery = () => {
    if (!user) {
      Alert.alert(t('login-required'), t('please-login-add'));
      return;
    }
    setShowAddForm(true);
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    setRefreshTrigger(prev => prev + 1);
    Alert.alert(t('success'), t('machinery-added-success'));
  };

  const handleRentalSuccess = () => {
    setShowRentalForm(false);
    setSelectedMachineryForRent(null);
  };

  const handleMarkerPress = (machinery: Equipment) => {
    setSelectedMachinery(machinery);
  };

  const renderItem = ({ item }: { item: Equipment }) => (
    <EquipmentListItem
      name={item.name}
      status={item.available ? "Available" : "Not Available"}
      statusColor={item.available ? COLORS.success : COLORS.error}
      distance={`${item.distance} km away`}
      imageUrl={item.imageUrl}
      price={item.price}
      onPress={() => handleReserve(item.id)}
      buttonText="Reserve"
      buttonDisabled={!item.available}
    />
  );

  const renderMachineryItem = ({ item }: { item: Machinery }) => (
    <EquipmentListItem
      name={item.name}
      status={item.available ? "Available" : "Not Available"}
      statusColor={item.available ? COLORS.success : COLORS.error}
      distance={`${item.location.address}`}
      imageUrl={item.imageUrl}
      price={`৳${item.pricePerHour}/hr - ৳${item.pricePerDay}/day`}
      onPress={() => handleReserve(item.id)}
      buttonText="Rent Now"
      buttonDisabled={!item.available}
    />
  );

  const renderMapView = () => {
    // Convert userLocation to the expected format
    const convertedUserLocation = userLocation ? {
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude
    } : null;

    // Combine equipment and machinery for map display
    const allEquipment = [
      ...equipment,
      ...availableMachinery.map(m => {
        const distance = calculateDistance(
          location?.latitude || 0, 
          location?.longitude || 0, 
          m.location.latitude, 
          m.location.longitude
        );
        return {
          id: m.id,
          name: m.name,
          available: m.available,
          distance: `${distance}`,
          imageUrl: m.imageUrl,
          price: `৳${m.pricePerHour}/hr`,
          latitude: m.location.latitude,
          longitude: m.location.longitude,
        };
      })
    ];

    return (
      <View style={styles.mapContainer}>
        <MachineryMap 
          equipment={allEquipment}
          onReserve={handleReserve}
          onMarkerPress={handleMarkerPress}
          userLocation={convertedUserLocation}
        />
        {convertedUserLocation && (
          <TouchableOpacity style={styles.locateButton} onPress={handleLocateUser}>
            <LocateFixed size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderBrowseContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    const hasEquipment = equipment.length > 0 || availableMachinery.length > 0;

    if (!hasEquipment) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No equipment found in your area</Text>
        </View>
      );
    }

    if (viewMode === "map") {
      return (
        <>
          {renderMapView()}
          {selectedMachinery && (
            <MachineryQuickInfoBanner 
              machinery={selectedMachinery} 
              onPress={handleReserve} 
              onClose={() => setSelectedMachinery(null)}
            />
          )}
        </>
      );
    }

    return (
      <FlatList
        data={[...equipment, ...availableMachinery]}
        renderItem={({ item }) => {
          // Check if it's a Machinery object or Equipment object
          if ('pricePerHour' in item) {
            return renderMachineryItem({ item: item as Machinery });
          } else {
            return renderItem({ item: item as Equipment });
          }
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const tabs = [
    { key: "browse-machinery", label: t('browse-machinery') },
    { key: "my-machinery", label: t('my-machinery') },
    { key: "rental-history", label: t('rental-history') }
  ];

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t('machinery-rental')} 
        showBackButton={true}
      />
      
      {!hasLocationPermission && (
        <View style={styles.permissionBanner}>
          <AlertCircle size={20} color={COLORS.warning} />
          <Text style={styles.permissionText}>
            {t('location-access-required')}
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
            onPress={requestLocationPermission}
          >
            <Text style={styles.permissionButtonText}>{t('enable-location')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TabView
        tabs={tabs.map(tab => tab.label)}
        activeTab={tabs.find(tab => tab.key === activeTab)?.label || tabs[0].label}
        onChangeTab={(tabLabel) => {
          const tab = tabs.find(t => t.label === tabLabel);
          if (tab) setActiveTab(tab.key);
        }}
      />

      {activeTab === "browse-machinery" && (
        <>
          <View style={styles.viewToggleContainer}>
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "list" && styles.activeViewToggleButton,
              ]}
              onPress={() => setViewMode("list")}
            >
              <List size={20} color={viewMode === "list" ? COLORS.white : COLORS.textPrimary} />
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "list" && styles.activeViewToggleText,
                ]}
              >
                {t('list-view')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.viewToggleButton,
                viewMode === "map" && styles.activeViewToggleButton,
              ]}
              onPress={() => setViewMode("map")}
            >
              <MapPin size={20} color={viewMode === "map" ? COLORS.white : COLORS.textPrimary} />
              <Text
                style={[
                  styles.viewToggleText,
                  viewMode === "map" && styles.activeViewToggleText,
                ]}
              >
                {t('map-view')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {renderBrowseContent()}
        </>
      )}

      {activeTab === "my-machinery" && (
        <UserMachineryList 
          onAddNew={handleAddMachinery}
          refreshTrigger={refreshTrigger}
        />
      )}

      {activeTab === "rental-history" && (
        <RentalHistory type="renter" />
      )}

      {/* Add Machinery Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddMachineryForm
          onSuccess={handleAddSuccess}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      {/* Rental Form Modal */}
      <Modal
        visible={showRentalForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedMachineryForRent && (
          <MachineryRentalForm
            machinery={selectedMachineryForRent}
            onSuccess={handleRentalSuccess}
            onCancel={() => {
              setShowRentalForm(false);
              setSelectedMachineryForRent(null);
            }}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  viewToggleContainer: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 8,
  },
  viewToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.lightBackground,
  },
  activeViewToggleButton: {
    backgroundColor: COLORS.primary,
  },
  viewToggleText: {
    marginLeft: 4,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  activeViewToggleText: {
    color: COLORS.white,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  locateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    padding: 12,
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
  },
  permissionText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    color: "#856404",
    fontSize: 14,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "500",
  },
});
