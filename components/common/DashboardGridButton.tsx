import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "@/constants/colors";

type DashboardGridButtonProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
};

const DashboardGridButton: React.FC<DashboardGridButtonProps> = ({
  icon,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "48%",
    aspectRatio: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
});

export default DashboardGridButton;