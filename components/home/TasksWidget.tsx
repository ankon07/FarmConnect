import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { 
  CheckCircle, 
  Circle, 
  Calendar, 
  Clock, 
  Plus,
  Sprout,
  Droplets,
  Scissors
} from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'planting' | 'watering' | 'harvesting' | 'maintenance';
  dueTime: string;
  estimatedDuration: string;
}

const TasksWidget: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Water tomato plants',
      description: 'Check soil moisture and water if needed',
      completed: false,
      priority: 'high',
      category: 'watering',
      dueTime: '08:00 AM',
      estimatedDuration: '30 min',
    },
    {
      id: '2',
      title: 'Harvest lettuce',
      description: 'Pick mature lettuce leaves from section A',
      completed: false,
      priority: 'medium',
      category: 'harvesting',
      dueTime: '10:00 AM',
      estimatedDuration: '45 min',
    },
    {
      id: '3',
      title: 'Plant corn seeds',
      description: 'Plant corn seeds in prepared field section B',
      completed: true,
      priority: 'high',
      category: 'planting',
      dueTime: '06:00 AM',
      estimatedDuration: '2 hours',
    },
    {
      id: '4',
      title: 'Prune fruit trees',
      description: 'Remove dead branches from apple trees',
      completed: false,
      priority: 'low',
      category: 'maintenance',
      dueTime: '02:00 PM',
      estimatedDuration: '1 hour',
    },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return COLORS.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'planting': return <Sprout size={16} color={COLORS.primary} />;
      case 'watering': return <Droplets size={16} color="#2196F3" />;
      case 'harvesting': return <Scissors size={16} color="#FF9800" />;
      case 'maintenance': return <Circle size={16} color="#9C27B0" />;
      default: return <Circle size={16} color={COLORS.textSecondary} />;
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{t("todays-tasks")}</Text>
          <Text style={styles.subtitle}>
            {completedTasks} {t("of")} {totalTasks} {t("completed")}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progressPercentage}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
      </View>

      {/* Tasks List */}
      <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
        {tasks.map((task, index) => (
          <Animated.View
            key={task.id}
            style={[
              styles.taskItem,
              task.completed && styles.taskItemCompleted,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.taskContent}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskLeft}>
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => toggleTask(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle size={24} color={COLORS.primary} />
                  ) : (
                    <Circle size={24} color={COLORS.textSecondary} />
                  )}
                </TouchableOpacity>
                
                <View style={styles.taskInfo}>
                  <View style={styles.taskTitleRow}>
                    {getCategoryIcon(task.category)}
                    <Text
                      style={[
                        styles.taskTitle,
                        task.completed && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.taskDescription,
                      task.completed && styles.taskDescriptionCompleted,
                    ]}
                  >
                    {task.description}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View style={styles.timeContainer}>
                      <Clock size={12} color={COLORS.textSecondary} />
                      <Text style={styles.timeText}>{task.dueTime}</Text>
                    </View>
                    <Text style={styles.durationText}>{task.estimatedDuration}</Text>
                  </View>
                </View>
              </View>
              
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(task.priority) },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter(t => !t.completed).length}</Text>
          <Text style={styles.statLabel}>{t("pending")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.filter(t => t.priority === 'high' && !t.completed).length}</Text>
          <Text style={styles.statLabel}>{t("high-priority")}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.round(tasks.reduce((acc, task) => {
            const duration = parseInt(task.estimatedDuration);
            return acc + (isNaN(duration) ? 0 : duration);
          }, 0) / 60)}</Text>
          <Text style={styles.statLabel}>{t("hours-left")}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tasksList: {
    maxHeight: 60,
    marginBottom: 8,
  },
  taskItem: {
    marginBottom: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  taskItemCompleted: {
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  taskLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 6,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskDescription: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  durationText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  priorityIndicator: {
    width: 3,
    height: 30,
    borderRadius: 1,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});

export default TasksWidget;
