import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bamisScrapingService, WeatherForecast, WeatherCaution, BamisData } from '../../services/bamisScrapingService';
import { dailySchedulerService } from '../../services/dailySchedulerService';
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadBamisData();
  }, []);

  const loadBamisData = async () => {
    try {
      setLoading(true);
      const data = await bamisScrapingService.getLatestData();
      setBamisData(data);
      setLastUpdated(data?.lastScraped || null);
    } catch (error) {
      console.error('Error loading BAMIS data:', error);
      Alert.alert('ত্রুটি', 'আবহাওয়া তথ্য লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await bamisScrapingService.forceRefresh();
      setBamisData(data);
      setLastUpdated(data?.lastScraped || null);
    } catch (error) {
      console.error('Error refreshing BAMIS data:', error);
      Alert.alert('ত্রুটি', 'আবহাওয়া তথ্য আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setRefreshing(false);
    }
  };

  const handleForceRunScheduler = async () => {
    try {
      Alert.alert(
        'স্ক্র্যাপিং শুরু করুন',
        'আপনি কি এখনই BAMIS ডেটা স্ক্র্যাপিং শুরু করতে চান?',
        [
          { text: 'বাতিল', style: 'cancel' },
          {
            text: 'শুরু করুন',
            onPress: async () => {
              await dailySchedulerService.forceRunTask('bamis_morning_scrape');
              setTimeout(() => loadBamisData(), 2000); // Reload after 2 seconds
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error running scheduler:', error);
      Alert.alert('ত্রুটি', 'স্ক্র্যাপিং শুরু করতে সমস্যা হয়েছে');
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'warning';
      case 'high': return 'alert-circle';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'information-circle';
    }
  };

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'কখনো আপডেট হয়নি';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} ঘন্টা ${diffMinutes} মিনিট আগে`;
    } else {
      return `${diffMinutes} মিনিট আগে`;
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
          <Ionicons name="cloud" size={24} color={COLORS.primary} />
          <Text style={styles.title}>BAMIS আবহাওয়া তথ্য</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>তথ্য লোড হচ্ছে...</Text>
        </View>
      </View>
    );
  }

  if (!bamisData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="cloud" size={24} color={COLORS.primary} />
          <Text style={styles.title}>BAMIS আবহাওয়া তথ্য</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline" size={48} color="#999" />
          <Text style={styles.errorText}>আবহাওয়া তথ্য পাওয়া যায়নি</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBamisData}>
            <Text style={styles.retryButtonText}>পুনরায় চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayData = filterDataByRegion(bamisData);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="cloud" size={24} color={COLORS.primary} />
        <Text style={styles.title}>BAMIS আবহাওয়া তথ্য</Text>
        <TouchableOpacity onPress={handleForceRunScheduler} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Last Updated */}
      <View style={styles.lastUpdatedContainer}>
        <Text style={styles.lastUpdatedText}>
          শেষ আপডেট: {formatLastUpdated(lastUpdated)}
        </Text>
        <Text style={styles.bulletinDate}>বুলেটিন: {bamisData.bulletinDate}</Text>
      </View>

      {/* Weather Forecasts */}
      {displayData.forecasts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>আবহাওয়া পূর্বাভাস</Text>
          {displayData.forecasts.slice(0, 3).map((forecast) => (
            <View key={forecast.id} style={styles.forecastCard}>
              <View style={styles.forecastHeader}>
                <Text style={styles.forecastDate}>{forecast.date}</Text>
                <Text style={styles.forecastPeriod}>{forecast.period}</Text>
              </View>
              <View style={styles.forecastContent}>
                <View style={styles.temperatureContainer}>
                  <Ionicons name="thermometer" size={16} color="#FF5722" />
                  <Text style={styles.temperature}>
                    {forecast.temperature.min}° - {forecast.temperature.max}°সে
                  </Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="water" size={16} color="#2196F3" />
                  <Text style={styles.weatherDetailText}>আর্দ্রতা: {forecast.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Ionicons name="rainy" size={16} color="#4CAF50" />
                  <Text style={styles.weatherDetailText}>বৃষ্টি: {forecast.rainfall}</Text>
                </View>
                <Text style={styles.forecastDescription}>{forecast.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Weather Cautions */}
      {displayData.cautions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>সতর্কতা ও পরামর্শ</Text>
          {displayData.cautions.map((caution) => (
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
                  name={getSeverityIcon(caution.severity) as any}
                  size={20}
                  color={getSeverityColor(caution.severity)}
                />
                <Text style={styles.cautionTitle}>{caution.title}</Text>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(caution.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {caution.severity === 'critical' ? 'জরুরি' :
                     caution.severity === 'high' ? 'উচ্চ' :
                     caution.severity === 'medium' ? 'মাঝারি' : 'নিম্ন'}
                  </Text>
                </View>
              </View>
              <Text style={styles.cautionDescription} numberOfLines={3}>
                {caution.description}
              </Text>
              <View style={styles.cautionFooter}>
                <Text style={styles.cautionCategory}>
                  {caution.category === 'weather' ? 'আবহাওয়া' :
                   caution.category === 'crop' ? 'ফসল' :
                   caution.category === 'livestock' ? 'পশুপাখি' :
                   caution.category === 'fisheries' ? 'মৎস্য' : 'সাধারণ'}
                </Text>
                <Text style={styles.cautionRegion}>{caution.region}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Empty State */}
      {displayData.forecasts.length === 0 && displayData.cautions.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>
            {userRegion ? `${userRegion} অঞ্চলের জন্য কোন তথ্য পাওয়া যায়নি` : 'কোন আবহাওয়া তথ্য পাওয়া যায়নি'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  lastUpdatedContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
  },
  bulletinDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginHorizontal: 16,
    color: '#333',
  },
  forecastCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  forecastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  forecastDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastPeriod: {
    fontSize: 12,
    color: '#666',
  },
  forecastContent: {
    gap: 8,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  temperature: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherDetailText: {
    fontSize: 14,
    color: '#666',
  },
  forecastDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  cautionCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  cautionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  cautionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  cautionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cautionCategory: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  cautionRegion: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default BamisWeatherWidget;
