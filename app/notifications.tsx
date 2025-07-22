import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { getCurrentNotifications } from "@/services/bamisApi";
import { bamisScrapingService } from "@/services/bamisScrapingService";
import { AlertTriangle, Clock, RefreshCw, CheckCircle } from "lucide-react-native";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'weather' | 'crop' | 'livestock' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  region?: string;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Prioritize scraped data over old BAMIS API
      const scrapedData = await bamisScrapingService.getLatestData();
      let allNotifications: Notification[] = [];
      
      // Convert scraped BAMIS data to notifications
      if (scrapedData) {
        // Add weather forecast notifications
        if (scrapedData.forecasts.length > 0) {
          const latestForecast = scrapedData.forecasts[0];
          allNotifications.unshift({
            id: `forecast_${latestForecast.id}`,
            title: 'আজকের আবহাওয়া পূর্বাভাস',
            message: `তাপমাত্রা: ${latestForecast.temperature.min}°-${latestForecast.temperature.max}°সে, আর্দ্রতা: ${latestForecast.humidity}%, ${latestForecast.description}`,
            type: 'weather' as const,
            priority: 'medium' as const,
            timestamp: latestForecast.lastUpdated,
            region: latestForecast.region,
            isRead: false
          });
        }
        
        // Add caution notifications (prioritize high severity)
        const sortedCautions = scrapedData.cautions.sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });
        
        sortedCautions.slice(0, 5).forEach(caution => {
          const priority = caution.severity === 'critical' || caution.severity === 'high' ? 'high' :
                          caution.severity === 'medium' ? 'medium' : 'low';
          
          const type = caution.category === 'weather' ? 'weather' :
                      caution.category === 'crop' ? 'crop' :
                      caution.category === 'livestock' ? 'livestock' : 'urgent';
          
          allNotifications.unshift({
            id: `caution_${caution.id}`,
            title: caution.title,
            message: caution.description,
            type: type as 'weather' | 'crop' | 'livestock' | 'urgent',
            priority: priority as 'high' | 'medium' | 'low',
            timestamp: caution.issuedAt,
            region: caution.region,
            isRead: false
          });
        });
        
        // Add bulletin update notification
        allNotifications.unshift({
          id: `bulletin_${Date.now()}`,
          title: 'BAMIS বুলেটিন আপডেট',
          message: `নতুন কৃষি আবহাওয়া বুলেটিন প্রকাশিত হয়েছে (${scrapedData.bulletinDate})। ${scrapedData.forecasts.length}টি পূর্বাভাস এবং ${scrapedData.cautions.length}টি সতর্কতা রয়েছে।`,
          type: 'weather' as const,
          priority: 'medium' as const,
          timestamp: scrapedData.lastScraped,
          isRead: false
        });
      }
      
      // Sort by timestamp (newest first) and limit to 20 notifications
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setNotifications(allNotifications.slice(0, 20));
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Fallback to just BAMIS API notifications
      try {
        const fallbackData = await getCurrentNotifications();
        setNotifications(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const forceScrapeData = async () => {
    try {
      setLoading(true);
      // Force scrape fresh data from BAMIS website
      const freshData = await bamisScrapingService.forceRefresh();
      if (freshData) {
        // Reload notifications with fresh data
        await loadNotifications();
      }
    } catch (error) {
      console.error('Error force scraping data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const color = priority === 'high' ? COLORS.error : 
                  priority === 'medium' ? COLORS.warning : COLORS.info;
    
    switch (type) {
      case 'urgent':
        return <AlertTriangle size={20} color={color} />;
      case 'weather':
        return <AlertTriangle size={20} color={color} />;
      default:
        return <AlertTriangle size={20} color={color} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <TouchableOpacity 
      style={[
        styles.notificationCard,
        !notification.isRead && styles.unreadCard
      ]}
      onPress={() => markAsRead(notification.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(notification.type, notification.priority)}
        </View>
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={[
              styles.cardTitle,
              !notification.isRead && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <View style={styles.statusIndicators}>
              {notification.isRead && (
                <CheckCircle size={16} color={COLORS.success} />
              )}
              {!notification.isRead && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={styles.cardMessage}>{notification.message}</Text>
          <View style={styles.timestampRow}>
            <Clock size={12} color={COLORS.textSecondary} />
            <Text style={styles.timestamp}>
              {notification.timestamp.toLocaleString('bn-BD', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: `${getPriorityColor(notification.priority)}20` }
            ]}>
              <Text style={[
                styles.priorityText,
                { color: getPriorityColor(notification.priority) }
              ]}>
                {notification.priority === 'high' ? 'জরুরি' : 
                 notification.priority === 'medium' ? 'গুরুত্বপূর্ণ' : 'সাধারণ'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Agricultural Alerts" 
        showBackButton={true}
        showHelpButton={false}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{notifications.length}</Text>
              <Text style={styles.statLabel}>মোট বিজ্ঞপ্তি</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.error }]}>{unreadCount}</Text>
              <Text style={styles.statLabel}>অপঠিত</Text>
            </View>
          </View>
          
          <View style={styles.buttonRow}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                <CheckCircle size={16} color={COLORS.white} />
                <Text style={styles.markAllButtonText}>সব পড়া হয়েছে চিহ্নিত করুন</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.scrapeButton} onPress={forceScrapeData}>
              <RefreshCw size={16} color={COLORS.white} />
              <Text style={styles.scrapeButtonText}>নতুন ডেটা স্ক্র্যাপ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>বিজ্ঞপ্তি লোড হচ্ছে...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={48} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>কোন বিজ্ঞপ্তি নেই</Text>
            <Text style={styles.emptyText}>
              এই মুহূর্তে কোন কৃষি সতর্কতা বা বিজ্ঞপ্তি নেই।
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadNotifications}>
              <RefreshCw size={16} color={COLORS.white} />
              <Text style={styles.refreshButtonText}>রিফ্রেশ করুন</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            <Text style={styles.sectionTitle}>
              সাম্প্রতিক বিজ্ঞপ্তি ({notifications.length})
            </Text>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>বিজ্ঞপ্তি সম্পর্কে</Text>
          <Text style={styles.infoText}>
            এই বিজ্ঞপ্তিগুলি BAMIS (Bangladesh Agricultural Market Information System) থেকে 
            সরাসরি প্রাপ্ত কৃষি সংক্রান্ত গুরুত্বপূর্ণ তথ্য ও সতর্কতা। নিয়মিত চেক করুন 
            সর্বশেষ আপডেটের জন্য।
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  markAllButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  scrapeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warning,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: 150,
  },
  scrapeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  notificationsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  notificationCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  cardContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
