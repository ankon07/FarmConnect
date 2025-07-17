import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { COLORS } from "@/constants/colors";
import { Info, XCircle } from "lucide-react-native";

interface MachineryQuickInfoBannerProps {
  machinery: {
    id: string;
    name: string;
    available: boolean;
    distance: string;
    imageUrl: string;
    price: string;
  };
  onPress: (machineryId: string) => void;
  onClose: () => void;
}

export default function MachineryQuickInfoBanner({ machinery, onPress, onClose }: MachineryQuickInfoBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.infoContainer}>
          <Info size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>Quick-info available</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <XCircle size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.detailsCard} onPress={() => onPress(machinery.id)}>
        <Image source={{ uri: machinery.imageUrl }} style={styles.machineryImage} />
        <View style={styles.textContainer}>
          <Text style={styles.machineryName}>{machinery.name}</Text>
          <Text style={styles.machineryAvailability}>{machinery.available ? "Available" : "Not Available"}</Text>
          <Text style={styles.machineryDistance}>{machinery.distance} km</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  detailsCard: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  machineryImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.lightBackground, // Placeholder background
  },
  textContainer: {
    flex: 1,
  },
  machineryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  machineryAvailability: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  machineryDistance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
