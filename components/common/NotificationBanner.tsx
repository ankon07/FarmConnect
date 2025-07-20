import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { COLORS } from "@/constants/colors";
import { Bell, AlertTriangle, Leaf, Heart, CloudRain, X, ChevronDown, ChevronUp } from "lucide-react-native";
import { getCurrentWeatherBulletin, generateNotifications, markNotificationAsRead } from "@/services/bamisApi";

interface NotificationItem {
  id: string;
  type: 'weather' | 'crop' | 'livestock' | 'urgent';
  title: string;
  message: string;
  region?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
}

export default function NotificationBanner() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 minutes
    const interval = setInterval(loadNotifications, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const bulletin = await getCurrentWeatherBulletin();
      const newNotifications = await generateNotifications(bulletin);
      setNotifications(newNotifications);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconColor = priority === 'high' ? COLORS.error : 
                     priority === 'medium' ? COLORS.warning : COLORS.primary;
    
    switch (type) {
      case 'urgent':
        return <AlertTriangle size={16} color={iconColor} />;
      case 'crop':
        return <Leaf size={16} color={iconColor} />;
      case 'livestock':
        return <Heart size={16} color={iconColor} />;
      case 'weather':
        return <CloudRain size={16} color={iconColor} />;
      default:
        return <Bell size={16} color={iconColor} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'high').slice(0, 3);
  const displayNotifications = expanded ? notifications : urgentNotifications;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Bell size={20} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Agricultural Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Updated: {lastUpdated.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          )}
          {expanded ? (
            <ChevronUp size={20} color={COLORS.textSecondary} />
          ) : (
            <ChevronDown size={20} color={COLORS.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      {displayNotifications.length > 0 && (
        <ScrollView 
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {displayNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadNotification,
                { borderLeftColor: getPriorityColor(notification.priority) }
              ]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type, notification.priority)}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[
                    styles.notificationTitle,
                    !notification.isRead && styles.unreadTitle
                  ]}>
                    {notification.title}
                  </Text>
                  {notification.region && (
                    <Text style={styles.regionText}>{notification.region}</Text>
                  )}
                </View>
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(notification.priority) }
                ]} />
              </View>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
              <Text style={styles.timestamp}>
                {notification.timestamp.toLocaleString('bn-BD', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
            </TouchableOpacity>
          ))}
          
          {!expanded && notifications.length > 3 && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setExpanded(true)}
            >
              <Text style={styles.showMoreText}>
                Show {notifications.length - 3} more notifications
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.refreshButton}
        onPress={loadNotifications}
        disabled={loading}
      >
        <Text style={styles.refreshText}>
          {loading ? 'Refreshing...' : 'Refresh Alerts'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.lightBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  notificationsList: {
    maxHeight: 300,
  },
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  unreadNotification: {
    backgroundColor: `${COLORS.primary}05`,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  regionText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  showMoreButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
  },
  showMoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: COLORS.lightBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  refreshText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
