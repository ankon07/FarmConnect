import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Image } from "react-native";
import { COLORS } from "@/constants/colors";
import { Cloud, Wind, Droplets } from "lucide-react-native";
import { fetchWeatherForecast } from "@/services/api";
import { useLocation } from "@/context/LocationContext";
import { useTranslation } from "@/hooks/useTranslation";

interface WeatherData {
  current: {
    date: string;
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    iconUrl: string;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    iconUrl: string;
  }>;
  farmingTips: Array<{
    title: string;
    description: string;
  }>;
}

const WeatherWidget: React.FC = () => {
  const { location } = useLocation();
  const { t } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    if (!location) {
      setLoading(false);
      setError(t("location-not-available"));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWeatherForecast({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (response.success && response.data) {
        setWeather(response.data);
      } else {
        setError(response.message || t("weather-error"));
      }
    } catch (error) {
      console.error("Error loading weather data:", error);
      setError(t("weather-load-error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t("loading-weather")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>{t("no-weather-data")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.conditionText}>{weather.current.condition}</Text>
        <Image
          source={{ uri: weather.current.iconUrl }}
          style={styles.weatherIcon}
        />
      </View>
      
      <View style={styles.weatherInfoRow}>
        <Cloud size={20} color={COLORS.textSecondary} />
        <Text style={styles.weatherLabel}>{t("temperature")}</Text>
        <Text style={styles.weatherValue}>{weather.current.temperature}°C</Text>
      </View>

      <View style={styles.weatherInfoRow}>
        <Droplets size={20} color={COLORS.textSecondary} />
        <Text style={styles.weatherLabel}>{t("humidity")}</Text>
        <Text style={styles.weatherValue}>{weather.current.humidity}%</Text>
      </View>

      <View style={styles.weatherInfoRow}>
        <Wind size={20} color={COLORS.textSecondary} />
        <Text style={styles.weatherLabel}>{t("wind-speed")}</Text>
        <Text style={styles.weatherValue}>{weather.current.windSpeed} km/h</Text>
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
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  conditionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  weatherIcon: {
    width: 30,
    height: 30,
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
});

export default WeatherWidget;
