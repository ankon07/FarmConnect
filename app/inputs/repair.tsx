import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { getRepairStatus, requestRepair } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import TabView from "@/components/common/TabView";
import EquipmentListItem from "@/components/inputs/EquipmentListItem";
import StatusIndicator from "@/components/common/StatusIndicator";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";

interface RepairService {
  id: string;
  name: string;
  available: boolean;
  distance: string;
  imageUrl: string;
  price: string;
}

interface Booking {
  id: string;
  serviceName: string;
  status: string;
  bookingDate: string;
  scheduledDate: string | null;
  equipmentName: string;
  notes: string;
}

export default function RepairScreen() {
  const { location } = useLocation();
  const [activeTab, setActiveTab] = useState("Availability");
  const [repairServices, setRepairServices] = useState<RepairService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = ["Availability", "My Bookings"];

  useEffect(() => {
    if (activeTab === "Availability") {
      loadRepairServices();
    } else {
      loadBookings();
    }
  }, [activeTab, location]);

  const loadRepairServices = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getRepairStatus({
        latitude: location.latitude,
        longitude: location.longitude,
        type: "services",
      });
      
      if (response.success) {
        setRepairServices(response.data);
      } else {
        setError("Failed to load repair services");
      }
    } catch (error) {
      console.error("Error loading repair services:", error);
      setError("An error occurred while loading repair services");
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getRepairStatus({
        type: "bookings",
      });
      
      if (response.success) {
        setBookings(response.data);
      } else {
        setError("Failed to load bookings");
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
      setError("An error occurred while loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRepair = async (serviceId: string) => {
    try {
      const response = await requestRepair(serviceId);
      if (response.success) {
        // Refresh the bookings list
        loadBookings();
        // Switch to the bookings tab
        setActiveTab("My Bookings");
      } else {
        alert("Failed to book repair service. Please try again.");
      }
    } catch (error) {
      console.error("Error booking repair:", error);
      alert("An error occurred while booking repair service");
    }
  };

  const renderServiceItem = ({ item }: { item: RepairService }) => (
    <EquipmentListItem
      name={item.name}
      status={item.available ? "Available" : "Busy"}
      statusColor={item.available ? COLORS.success : COLORS.warning}
      distance={`${item.distance} km away`}
      imageUrl={item.imageUrl}
      price={item.price}
      onPress={() => handleBookRepair(item.id)}
      buttonText="Book Now"
      buttonDisabled={!item.available}
    />
  );

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingTitle}>{item.serviceName}</Text>
        <StatusIndicator 
          text={item.status} 
          color={
            item.status === "Completed" ? COLORS.success :
            item.status === "In Progress" ? COLORS.warning :
            COLORS.primary
          }
        />
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.bookingDate}>Booked on: {item.bookingDate}</Text>
        {item.scheduledDate && (
          <Text style={styles.bookingSchedule}>Scheduled: {item.scheduledDate}</Text>
        )}
      </View>
      
      <View style={styles.bookingEquipment}>
        <Text style={styles.equipmentLabel}>Equipment:</Text>
        <Text style={styles.equipmentName}>{item.equipmentName}</Text>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
      
      {item.status === "Requested" && (
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Repair & Servicing" 
        showBackButton={true}
        showLocation={true}
        location={location?.name || "Loading location..."}
      />
      
      <TabView 
        tabs={tabs} 
        activeTab={activeTab} 
        onChangeTab={setActiveTab}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : activeTab === "Availability" ? (
        repairServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No repair services found in your area</Text>
          </View>
        ) : (
          <FlatList
            data={repairServices}
            renderItem={renderServiceItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no repair bookings</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            renderItem={renderBookingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  bookingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  bookingDetails: {
    marginBottom: 12,
  },
  bookingDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  bookingSchedule: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  bookingEquipment: {
    flexDirection: "row",
    marginBottom: 12,
  },
  equipmentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  equipmentName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  notesContainer: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "500",
  },
});