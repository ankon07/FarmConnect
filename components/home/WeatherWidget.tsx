import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "@/constants/colors";
import { Cloud, Leaf } from "lucide-react-native";

type WeatherWidgetProps = {
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
    soilMoisture: string;
    iconUrl: string;
  };
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.conditionText}>{weather.condition}</Text>
      
      <View style={styles.weatherInfoRow}>
        <Cloud size={20} color={COLORS.textSecondary} />
        <Text style={styles.weatherLabel}>Weather</Text>
        <Text style={styles.weatherValue}>{weather.temperature}°C</Text>
      </View>

      <View style={styles.soilInfoRow}>
        <Leaf size={20} color={COLORS.textSecondary} />
        <Text style={styles.soilLabel}>Soil Moisture</Text>
        <Text style={styles.soilValue}>{weather.soilMoisture}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  conditionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  weatherInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  weatherLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  soilInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  soilLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  soilValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default WeatherWidget;
