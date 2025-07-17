import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";

type StatusIndicatorProps = {
  text: string;
  color: string;
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ text, color }) => {
  return (
    <View style={[styles.container, { backgroundColor: `${color}20` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default StatusIndicator;