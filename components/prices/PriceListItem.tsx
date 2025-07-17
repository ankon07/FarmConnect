import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type PriceListItemProps = {
  itemName: string;
  itemPrice: string;
  itemUnit: string;
  marketName: string;
  distance: string;
};

const PriceListItem: React.FC<PriceListItemProps> = ({
  itemName,
  itemPrice,
  itemUnit,
  marketName,
  distance,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Text style={styles.itemName}>{itemName}</Text>
        <Text style={styles.marketName}>{marketName} • {distance} km</Text>
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{itemPrice}</Text>
        <Text style={styles.unit}>per {itemUnit}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mainContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  marketName: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  unit: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default PriceListItem;