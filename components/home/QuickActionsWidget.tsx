import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { 
  Sprout,
  Droplets,
  Scissors,
  Camera,
  MapPin,
  Phone,
  Calculator,
  Calendar,
  TrendingUp,
  Settings,
  Bell,
  MessageCircle
} from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

const QuickActionsWidget: React.FC = () => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
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
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'add-task',
      title: t("add-task"),
      description: t("create-farming-task"),
      icon: <Calendar size={20} color="#FFFFFF" />,
      color: '#4CAF50',
      onPress: () => Alert.alert('Add Task', 'Navigate to add task screen'),
    },
    {
      id: 'water-reminder',
      title: t("water-plants"),
      description: t("set-watering-reminder"),
      icon: <Droplets size={20} color="#FFFFFF" />,
      color: '#2196F3',
      onPress: () => Alert.alert('Water Reminder', 'Setting up watering reminder'),
    },
    {
      id: 'crop-monitor',
      title: t("monitor-crops"),
      description: t("check-crop-health"),
      icon: <Camera size={20} color="#FFFFFF" />,
      color: '#FF9800',
      onPress: () => Alert.alert('Crop Monitor', 'Opening crop monitoring'),
    },
    {
      id: 'field-map',
      title: 'Field Map',
      description: 'View field layout',
      icon: <MapPin size={20} color="#FFFFFF" />,
      color: '#9C27B0',
      onPress: () => Alert.alert('Field Map', 'Opening field map'),
    },
  ];

  const renderActionButton = (action: QuickAction, index: number) => {
    const animatedScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(animatedScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        key={action.id}
        style={[
          styles.actionButtonContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { scale: animatedScale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: action.color }]}
          onPress={action.onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            {action.icon}
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionDescription}>{action.description}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("quick-actions")}</Text>
        <Text style={styles.subtitle}>{t("tap-to-perform-tasks")}</Text>
      </View>

      {/* Actions Grid */}
      <View style={styles.actionsGrid}>
        {quickActions.map((action, index) => renderActionButton(action, index))}
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Sprout size={20} color={COLORS.primary} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Active Tasks</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <TrendingUp size={20} color="#4CAF50" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <MessageCircle size={20} color="#FF9800" />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
        </View>
      </View>

      {/* Quick Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Quick Tip</Text>
        <Text style={styles.tipsText}>
          Water your plants early morning or late evening to reduce water evaporation and stress on plants.
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  actionButtonContainer: {
    width: '48%',
  },
  actionButton: {
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  actionIconContainer: {
    marginRight: 6,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  actionDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 4,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  tipsContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
    padding: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tipsText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    lineHeight: 12,
  },
});

export default QuickActionsWidget;
