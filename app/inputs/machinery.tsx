import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { getEquipmentList } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import EquipmentListItem from "@/components/inputs/EquipmentListItem";
import MachineryMap from "@/components/inputs/MachineryMap";
import MachineryQuickInfoBanner from "@/components/inputs/MachineryQuickInfoBanner";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { MapPin, List, LocateFixed } from "lucide-react-native";
import * as Location from 'expo-location';

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
  const { location } = useLocation();
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMachinery, setSelectedMachinery] = useState<Equipment | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
    loadEquipment();
  }, [location]);

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
        // Add dummy latitude and longitude to equipment if not present
        const equipmentWithCoords = response.data.map((item: Equipment, index: number) => ({
          ...item,
          latitude: item.latitude || (location.latitude + (index * 0.001 * (index % 2 === 0 ? 1 : -1))),
          longitude: item.longitude || (location.longitude + (index * 0.001 * (index % 2 === 0 ? 1 : -1))),
        }));
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

  const handleLocateUser = () => {
    if (userLocation) {
      // This will trigger the useEffect in MachineryMap to update the map view
      // For now, we'll just log it. The actual map centering will happen via prop update.
      console.log("Centering map on user location:", userLocation);
      // In a real app, you might want to explicitly send a message to the WebView
      // if the map doesn't automatically re-center on userLocation change.
    } else {
      setError("User location not available.");
    }
  };

  const handleReserve = (equipmentId: string) => {
    console.log(`Reserving equipment ${equipmentId}`);
    // In a real app, we would call an API to reserve the equipment
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

  const renderMapView = () => (
    <View style={styles.mapContainer}>
    <MachineryMap 
      equipment={equipment}
      onReserve={handleReserve}
      onMarkerPress={handleMarkerPress}
      userLocation={userLocation}
    />
      {userLocation && (
        <TouchableOpacity style={styles.locateButton} onPress={handleLocateUser}>
          <LocateFixed size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Machinery Rental" 
        showBackButton={true}
      />
      
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
            List View
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
            Map View
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : equipment.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No equipment found in your area</Text>
        </View>
      ) : viewMode === "map" ? (
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
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderItem}
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
});
