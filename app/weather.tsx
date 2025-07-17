import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { fetchWeatherForecast } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { useLocation } from "@/context/LocationContext";
import { Droplets, Wind, Thermometer, Sun } from "lucide-react-native";

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

export default function WeatherScreen() {
  const { location } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchWeatherForecast({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      
      if (response.success) {
        setWeather(response.data);
      } else {
        setError("Failed to load weather data");
      }
    } catch (error) {
      console.error("Error loading weather data:", error);
      setError("An error occurred while loading weather data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Weather Forecast" 
        showBackButton={true}
        showLocation={true}
        location={location?.name || "Loading location..."}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : weather ? (
        <ScrollView style={styles.scrollView}>
          <View style={styles.currentWeatherContainer}>
            <View style={styles.currentWeatherHeader}>
              <Text style={styles.currentDate}>{formatDate(weather.current.date)}</Text>
              <Text style={styles.currentCondition}>{weather.current.condition}</Text>
            </View>
            
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{weather.current.temperature}°C</Text>
              <Image
                source={{ uri: weather.current.iconUrl }}
                style={styles.weatherIcon}
              />
            </View>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Droplets size={24} color={COLORS.primary} />
                <Text style={styles.detailValue}>{weather.current.humidity}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Wind size={24} color={COLORS.primary} />
                <Text style={styles.detailValue}>{weather.current.windSpeed} km/h</Text>
                <Text style={styles.detailLabel}>Wind</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Thermometer size={24} color={COLORS.primary} />
                <Text style={styles.detailValue}>{weather.current.feelsLike}°C</Text>
                <Text style={styles.detailLabel}>Feels Like</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Sun size={24} color={COLORS.primary} />
                <Text style={styles.detailValue}>{weather.current.uvIndex}</Text>
                <Text style={styles.detailLabel}>UV Index</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>7-Day Forecast</Text>
            
            {weather.forecast.map((day, index) => (
              <View key={day.date} style={styles.forecastDay}>
                <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
                
                <View style={styles.forecastMiddle}>
                  <Image
                    source={{ uri: day.iconUrl }}
                    style={styles.forecastIcon}
                  />
                  <Text style={styles.forecastCondition}>{day.condition}</Text>
                </View>
                
                <View style={styles.forecastTemperature}>
                  <Text style={styles.maxTemp}>{day.maxTemp}°</Text>
                  <Text style={styles.minTemp}>{day.minTemp}°</Text>
                </View>
              </View>
            ))}
          </View>
          
          <View style={styles.farmingTipsContainer}>
            <Text style={styles.tipsTitle}>Farming Tips</Text>
            
            {weather.farmingTips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No weather data available</Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  currentWeatherContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentWeatherHeader: {
    marginBottom: 16,
  },
  currentDate: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  currentCondition: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  temperatureContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  temperature: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    alignItems: "center",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  forecastContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  forecastDay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  forecastDate: {
    width: 100,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  forecastMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  forecastIcon: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  forecastCondition: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  forecastTemperature: {
    flexDirection: "row",
    width: 80,
    justifyContent: "flex-end",
  },
  maxTemp: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  minTemp: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  farmingTipsContainer: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});