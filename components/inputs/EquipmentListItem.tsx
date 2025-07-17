import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { COLORS } from "@/constants/colors";
import StatusIndicator from "@/components/common/StatusIndicator";

type EquipmentListItemProps = {
  name: string;
  status: string;
  statusColor: string;
  distance: string;
  imageUrl: string;
  price: string;
  onPress: () => void;
  buttonText: string;
  buttonDisabled?: boolean;
};

const EquipmentListItem: React.FC<EquipmentListItemProps> = ({
  name,
  status,
  statusColor,
  distance,
  imageUrl,
  price,
  onPress,
  buttonText,
  buttonDisabled = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <StatusIndicator text={status} color={statusColor} />
      </View>
      
      <View style={styles.content}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
        />
        
        <View style={styles.infoContainer}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.distance}>{distance}</Text>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              buttonDisabled && styles.disabledButton,
            ]}
            onPress={onPress}
            disabled={buttonDisabled}
          >
            <Text
              style={[
                styles.actionButtonText,
                buttonDisabled && styles.disabledButtonText,
              ]}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  content: {
    flexDirection: "row",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  disabledButtonText: {
    color: COLORS.textSecondary,
  },
});

export default EquipmentListItem;