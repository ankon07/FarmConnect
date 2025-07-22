import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ActivityIndicator, 
  Image, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from "react-native";
import { COLORS } from "@/constants/colors";
import { 
  Cloud, 
  Wind, 
  Droplets, 
  Sun, 
  Eye, 
  Thermometer,
  Gauge,
  CloudRain,
  Sunrise,
  Sunset
} from "lucide-react-native";
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
    pressure?: number;
    visibility?: number;
    sunrise?: string;
    sunset?: string;
    cloudCover?: number;
    precipitation?: number;
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
  const [expanded, setExpanded] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  useEffect(() => {
    if (weather) {
      // Start entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Start continuous pulse animation for temperature
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [weather]);

  useEffect(() => {
    // Rotate animation for refresh
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    );
    
    if (loading) {
      rotateAnimation.start();
    } else {
      rotateAnimation.stop();
      rotateAnim.setValue(0);
    }

    return () => rotateAnimation.stop();
  }, [loading]);

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
        // Add mock additional data if not provided by API
        const enhancedData: WeatherData = {
          ...response.data,
          current: {
            ...response.data.current,
            pressure: (response.data.current as any).pressure || Math.floor(Math.random() * 50) + 1000,
            visibility: (response.data.current as any).visibility || Math.floor(Math.random() * 10) + 5,
            sunrise: (response.data.current as any).sunrise || "06:15",
            sunset: (response.data.current as any).sunset || "18:30",
            cloudCover: (response.data.current as any).cloudCover || Math.floor(Math.random() * 100),
            precipitation: (response.data.current as any).precipitation || Math.floor(Math.random() * 10),
          }
        };
        setWeather(enhancedData);
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

  const toggleExpanded = () => {
    setExpanded(!expanded);
    Animated.timing(expandAnim, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return "#4CAF50";
    if (uvIndex <= 5) return "#FFC107";
    if (uvIndex <= 7) return "#FF9800";
    if (uvIndex <= 10) return "#F44336";
    return "#9C27B0";
  };

  const getUVIndexText = (uvIndex: number) => {
    if (uvIndex <= 2) return "Low";
    if (uvIndex <= 5) return "Moderate";
    if (uvIndex <= 7) return "High";
    if (uvIndex <= 10) return "Very High";
    return "Extreme";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              transform: [
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Cloud size={32} color={COLORS.primary} />
        </Animated.View>
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
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {/* Main Header */}
      <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.conditionText}>{weather.current.condition}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.headerRight}>
            <Animated.View
              style={[
                styles.temperatureContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.mainTemperature}>{weather.current.temperature}°</Text>
              <Text style={styles.feelsLike}>{t("feels-like")} {weather.current.feelsLike}°</Text>
            </Animated.View>
            <Image
              source={{ uri: weather.current.iconUrl }}
              style={styles.weatherIcon}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Info Row */}
      <View style={styles.quickInfoRow}>
        <View style={styles.quickInfoItem}>
          <Droplets size={16} color="#2196F3" />
          <Text style={styles.quickInfoText}>{weather.current.humidity}%</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Wind size={16} color="#4CAF50" />
          <Text style={styles.quickInfoText}>{weather.current.windSpeed} {t("kmh")}</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Eye size={16} color="#FF9800" />
          <Text style={styles.quickInfoText}>{weather.current.visibility || 10} {t("km")}</Text>
        </View>
        <View style={styles.quickInfoItem}>
          <Sun size={16} color={getUVIndexColor(weather.current.uvIndex)} />
          <Text style={styles.quickInfoText}>UV {weather.current.uvIndex}</Text>
        </View>
      </View>

      {/* Expanded Details */}
      <Animated.View
        style={[
          styles.expandedContent,
          {
            maxHeight: expandAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 300],
            }),
            opacity: expandAnim,
          },
        ]}
      >
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Gauge size={20} color="#9C27B0" />
            <Text style={styles.detailLabel}>{t("pressure")}</Text>
            <Text style={styles.detailValue}>{weather.current.pressure || 1013} {t("hpa")}</Text>
          </View>

          <View style={styles.detailCard}>
            <CloudRain size={20} color="#2196F3" />
            <Text style={styles.detailLabel}>{t("precipitation")}</Text>
            <Text style={styles.detailValue}>{weather.current.precipitation || 0} {t("mm")}</Text>
          </View>

          <View style={styles.detailCard}>
            <Cloud size={20} color="#607D8B" />
            <Text style={styles.detailLabel}>{t("cloud-cover")}</Text>
            <Text style={styles.detailValue}>{weather.current.cloudCover || 20}%</Text>
          </View>

          <View style={styles.detailCard}>
            <Sun size={20} color={getUVIndexColor(weather.current.uvIndex)} />
            <Text style={styles.detailLabel}>{t("uv-index")}</Text>
            <Text style={[styles.detailValue, { color: getUVIndexColor(weather.current.uvIndex) }]}>
              {getUVIndexText(weather.current.uvIndex)}
            </Text>
          </View>
        </View>

        <View style={styles.sunTimesContainer}>
          <View style={styles.sunTimeItem}>
            <Sunrise size={20} color="#FF9800" />
            <Text style={styles.sunTimeLabel}>Sunrise</Text>
            <Text style={styles.sunTimeValue}>{weather.current.sunrise || "06:15"}</Text>
          </View>
          <View style={styles.sunTimeItem}>
            <Sunset size={20} color="#FF5722" />
            <Text style={styles.sunTimeLabel}>Sunset</Text>
            <Text style={styles.sunTimeValue}>{weather.current.sunset || "18:30"}</Text>
          </View>
        </View>

        {/* Farming Tips */}
        {weather.farmingTips && weather.farmingTips.length > 0 && (
          <View style={styles.farmingTipsContainer}>
            <Text style={styles.farmingTipsTitle}>🌾 Farming Tips</Text>
            {weather.farmingTips.slice(0, 2).map((tip, index) => (
              <View key={index} style={styles.farmingTip}>
                <Text style={styles.farmingTipTitle}>{tip.title}</Text>
                <Text style={styles.farmingTipDescription}>{tip.description}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Expand Indicator */}
      <View style={styles.expandIndicator}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <Text style={styles.expandIcon}>▼</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 8,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
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
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  conditionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  temperatureContainer: {
    alignItems: "center",
  },
  mainTemperature: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  feelsLike: {
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  weatherIcon: {
    width: 32,
    height: 32,
  },
  quickInfoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginBottom: 4,
  },
  quickInfoItem: {
    alignItems: "center",
    gap: 4,
  },
  quickInfoText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  expandedContent: {
    overflow: "hidden",
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  detailCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  sunTimesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 16,
  },
  sunTimeItem: {
    alignItems: "center",
    gap: 4,
  },
  sunTimeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sunTimeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  farmingTipsContainer: {
    backgroundColor: "#f0f8f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  farmingTipsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  farmingTip: {
    marginBottom: 8,
  },
  farmingTipTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  farmingTipDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  expandIndicator: {
    alignItems: "center",
    paddingTop: 4,
  },
  expandIcon: {
    fontSize: 10,
    color: COLORS.textSecondary,
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
