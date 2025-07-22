import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bamisScrapingService, WeatherForecast, WeatherCaution, BamisData } from '../../services/bamisScrapingService';
import { COLORS } from '../../constants/colors';

interface BamisWeatherWidgetProps {
  userRegion?: string;
  onNotificationPress?: (caution: WeatherCaution) => void;
}

export const BamisWeatherWidget: React.FC<BamisWeatherWidgetProps> = ({
  userRegion,
  onNotificationPress
}) => {
  const [bamisData, setBamisData] = useState<BamisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBamisData();
  }, []);

  const loadBamisData = async () => {
    try {
      setLoading(true);
      const data = await bamisScrapingService.getLatestData();
      setBamisData(data);
    } catch (error) {
      console.error('Error loading BAMIS data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await bamisScrapingService.forceRefresh();
      setBamisData(data);
    } catch (error) {
      console.error('Error refreshing BAMIS data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF1744';
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.primary;
    }
  };

  const filterDataByRegion = (data: BamisData) => {
    if (!userRegion) return data;
    
    const filteredForecasts = data.forecasts.filter(f => 
      f.region.includes(userRegion) || f.region === 'সারাদেশ'
    );
    
    const filteredCautions = data.cautions.filter(c => 
      c.region.includes(userRegion) || c.region === 'সারাদেশ'
    );
    
    return {
      ...data,
      forecasts: filteredForecasts,
      cautions: filteredCautions
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="cloud" size={20} color={COLORS.primary} />
          <Text style={styles.title}>BAMIS Weather</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!bamisData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="cloud" size={20} color={COLORS.primary} />
          <Text style={styles.title}>BAMIS Weather</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No weather data available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBamisData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayData = filterDataByRegion(bamisData);

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <View style={styles.header}>
        <Ionicons name="cloud" size={18} color={COLORS.primary} />
        <Text style={styles.title}>BAMIS Weather</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Latest Forecast */}
        {displayData.forecasts.length > 0 && (
          <View style={styles.forecastCard}>
            <View style={styles.forecastHeader}>
              <Text style={styles.forecastDate}>{displayData.forecasts[0].date}</Text>
              <View style={styles.temperatureContainer}>
                <Ionicons name="thermometer" size={14} color="#FF5722" />
                <Text style={styles.temperature}>
                  {displayData.forecasts[0].temperature.min}°-{displayData.forecasts[0].temperature.max}°C
                </Text>
              </View>
            </View>
            <Text style={styles.forecastDescription} numberOfLines={2}>
              {displayData.forecasts[0].description}
            </Text>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Ionicons name="water" size={12} color="#2196F3" />
                <Text style={styles.weatherDetailText}>{displayData.forecasts[0].humidity}%</Text>
              </View>
              <View style={styles.weatherDetail}>
                <Ionicons name="rainy" size={12} color="#4CAF50" />
                <Text style={styles.weatherDetailText}>{displayData.forecasts[0].rainfall}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Critical Cautions */}
        {displayData.cautions.length > 0 && (
          <View style={styles.cautionsSection}>
            <Text style={styles.sectionTitle}>Alerts ({displayData.cautions.length})</Text>
            {displayData.cautions.slice(0, 2).map((caution) => (
              <TouchableOpacity
                key={caution.id}
                style={[
                  styles.cautionCard,
                  { borderLeftColor: getSeverityColor(caution.severity) }
                ]}
                onPress={() => onNotificationPress?.(caution)}
              >
                <View style={styles.cautionHeader}>
                  <Ionicons
                    name="warning"
                    size={14}
                    color={getSeverityColor(caution.severity)}
                  />
                  <Text style={styles.cautionTitle} numberOfLines={1}>
                    {caution.title}
                  </Text>
                </View>
                <Text style={styles.cautionDescription} numberOfLines={2}>
                  {caution.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {displayData.forecasts.length === 0 && displayData.cautions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cloud-outline" size={32} color="#999" />
            <Text style={styles.emptyText}>
              No weather data available for {userRegion || 'your region'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 6,
    flex: 1,
    color: COLORS.textPrimary,
  },
  refreshButton: {
    padding: 4,
  },
  content: {
    maxHeight: 140,
  },
  forecastCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forecastDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  temperature: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  forecastDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
    lineHeight: 14,
  },
  weatherDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  weatherDetailText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  cautionsSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.textPrimary,
  },
  cautionCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    padding: 6,
    marginBottom: 4,
    borderLeftWidth: 3,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cautionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  cautionDescription: {
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default BamisWeatherWidget;
