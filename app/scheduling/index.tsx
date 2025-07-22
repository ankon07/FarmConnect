import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useScheduling } from '../../context/SchedulingContext';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Plus,
  CheckCircle,
  Droplets
} from 'lucide-react-native';
import { COLORS as colors } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';

export default function SchedulingScreen() {
  const router = useRouter();
  const { t: translate } = useTranslation();
  const {
    upcomingTasks,
    activeCrops,
    recentActivities,
    pendingReminders,
    weatherAlerts,
    isLoading,
    refreshDashboard,
    updateTask,
    state,
    overdueTasks,
    todaysTasks,
  } = useScheduling();

  const [selectedTab, setSelectedTab] = useState<'overview' | 'tasks' | 'crops' | 'calendar'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const hasInitialized = useRef(false);

  // Refresh data on initial mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      refreshDashboard();
    }
  }, [refreshDashboard]);

  // Refresh data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (hasInitialized.current) {
        refreshDashboard();
      }
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.primary;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.warning;
      case 'overdue': return colors.error;
      case 'pending': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Clock size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{upcomingTasks.length}</Text>
          <Text style={styles.statLabel}>{translate('Upcoming Tasks')}</Text>
        </View>
        <View style={styles.statCard}>
          <Activity size={24} color={colors.success} />
          <Text style={styles.statNumber}>{activeCrops.length}</Text>
          <Text style={styles.statLabel}>{translate('Active Crops')}</Text>
        </View>
        <View style={styles.statCard}>
          <AlertTriangle size={24} color={colors.warning} />
          <Text style={styles.statNumber}>{pendingReminders.length}</Text>
          <Text style={styles.statLabel}>{translate('Reminders')}</Text>
        </View>
        <View style={styles.statCard}>
          <Droplets size={24} color={colors.info} />
          <Text style={styles.statNumber}>{weatherAlerts.length}</Text>
          <Text style={styles.statLabel}>{translate('Weather Alerts')}</Text>
        </View>
      </View>

      {/* Comprehensive History Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translate('Scheduling History Overview')}</Text>
        <View style={styles.historyStatsContainer}>
          <View style={styles.historyStatCard}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.historyStatNumber}>
              {state.tasks.filter(task => task.status === 'completed').length}
            </Text>
            <Text style={styles.historyStatLabel}>{translate('Completed Tasks')}</Text>
          </View>
          <View style={styles.historyStatCard}>
            <AlertTriangle size={20} color={colors.error} />
            <Text style={styles.historyStatNumber}>{overdueTasks.length}</Text>
            <Text style={styles.historyStatLabel}>{translate('Overdue Tasks')}</Text>
          </View>
          <View style={styles.historyStatCard}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.historyStatNumber}>{state.crops.length}</Text>
            <Text style={styles.historyStatLabel}>{translate('Total Crops')}</Text>
          </View>
          <View style={styles.historyStatCard}>
            <Calendar size={20} color={colors.info} />
            <Text style={styles.historyStatNumber}>{state.activities.length}</Text>
            <Text style={styles.historyStatLabel}>{translate('Total Activities')}</Text>
          </View>
        </View>
      </View>

      {/* Today's Tasks */}
      {todaysTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate("Today's Tasks")}</Text>
          {todaysTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
              <View style={styles.taskHeader}>
                <View style={[styles.priorityIndicator, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusText}>{task.status}</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskDate}>
                  {task.scheduledDate.toLocaleDateString()}
                </Text>
                <Text style={styles.taskDuration}>
                  {task.estimatedDuration}h
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.error }]}>{translate('Overdue Tasks')}</Text>
          {overdueTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, { borderLeftColor: colors.error, borderLeftWidth: 4 }]}>
              <View style={styles.taskHeader}>
                <View style={[styles.priorityIndicator, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.statusText}>OVERDUE</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={[styles.taskDate, { color: colors.error }]}>
                  Due: {task.scheduledDate.toLocaleDateString()}
                </Text>
                <Text style={styles.taskDuration}>
                  {task.estimatedDuration}h
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.completeButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  Alert.alert(
                    'Complete Overdue Task',
                    `Mark "${task.title}" as completed?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Complete', 
                        onPress: async () => {
                          try {
                            await updateTask(task.id, { status: 'completed' });
                            Alert.alert('Success', 'Overdue task marked as completed');
                            await refreshDashboard();
                          } catch (error) {
                            console.error('Error completing task:', error);
                            Alert.alert('Error', 'Failed to complete task');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.completeButtonText}>{translate('Mark Complete')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Weather Alerts */}
      {weatherAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('Weather Alerts')}</Text>
          {weatherAlerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: colors.warning }]}>
              <View style={styles.alertHeader}>
                <AlertTriangle size={20} color={colors.warning} />
                <Text style={styles.alertTitle}>{alert.alertType.toUpperCase()}</Text>
                <Text style={styles.alertSeverity}>{alert.severity}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertDate}>
                {alert.startDate.toLocaleDateString()} - {alert.endDate.toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Upcoming Tasks */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translate('Upcoming Tasks')}</Text>
          <TouchableOpacity onPress={() => setSelectedTab('tasks')}>
            <Text style={styles.seeAllText}>{translate('See All')}</Text>
          </TouchableOpacity>
        </View>
        {upcomingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={colors.success} />
            <Text style={styles.emptyStateText}>{translate('No upcoming tasks')}</Text>
          </View>
        ) : (
          upcomingTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={[styles.priorityIndicator, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusText}>{task.status}</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskDate}>
                  {task.scheduledDate.toLocaleDateString()}
                </Text>
                <Text style={styles.taskDuration}>
                  {task.estimatedDuration}h
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Active Crops */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translate('Active Crops')}</Text>
          <TouchableOpacity onPress={() => setSelectedTab('crops')}>
            <Text style={styles.seeAllText}>{translate('See All')}</Text>
          </TouchableOpacity>
        </View>
        {activeCrops.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{translate('No active crops')}</Text>
          </View>
        ) : (
          activeCrops.slice(0, 3).map((crop) => (
            <View key={crop.id} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.cropName}</Text>
                {crop.variety && <Text style={styles.cropVariety}>({crop.variety})</Text>}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
                  <Text style={styles.statusText}>{crop.status}</Text>
                </View>
              </View>
              <Text style={styles.cropLocation}>{crop.fieldLocation}</Text>
              <View style={styles.cropFooter}>
                <Text style={styles.cropDate}>
                  Planted: {crop.plantingDate.toLocaleDateString()}
                </Text>
                <Text style={styles.cropDate}>
                  Harvest: {crop.harvestDate.toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translate('Recent Activities')}</Text>
        {recentActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{translate('No recent activities')}</Text>
          </View>
        ) : (
          recentActivities.slice(0, 5).map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityType}>{activity.activityType}</Text>
                <Text style={styles.activityDate}>
                  {activity.date.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.activityDescription}>{activity.description}</Text>
              {activity.cropName && (
                <Text style={styles.activityCrop}>Crop: {activity.cropName}</Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Complete Scheduling History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{translate('Complete Scheduling History')}</Text>
        
        {/* All Tasks History */}
        <View style={styles.historySubSection}>
          <Text style={styles.historySubTitle}>{translate('All Tasks History')}</Text>
          {state.tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={32} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>{translate('No tasks in history')}</Text>
            </View>
          ) : (
            state.tasks
              .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
              .slice(0, 10)
              .map((task) => (
                <View key={task.id} style={[styles.taskCard, styles.historyCard]}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.priorityIndicator, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                      <Text style={styles.statusText}>{task.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskDate}>
                      {task.scheduledDate.toLocaleDateString()}
                    </Text>
                    <Text style={styles.taskDuration}>
                      {task.estimatedDuration}h
                    </Text>
                  </View>
                  {task.status === 'completed' && (
                    <View style={styles.completedIndicator}>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={styles.completedText}>{translate('Completed')}</Text>
                    </View>
                  )}
                </View>
              ))
          )}
          {state.tasks.length > 10 && (
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => setSelectedTab('tasks')}
            >
              <Text style={styles.viewMoreText}>
                {translate('View All')} ({state.tasks.length} {translate('total')})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* All Crops History */}
        <View style={styles.historySubSection}>
          <Text style={styles.historySubTitle}>{translate('All Crops History')}</Text>
          {state.crops.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={32} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>{translate('No crops in history')}</Text>
            </View>
          ) : (
            state.crops
              .sort((a, b) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime())
              .slice(0, 10)
              .map((crop) => (
                <View key={crop.id} style={[styles.cropCard, styles.historyCard]}>
                  <View style={styles.cropHeader}>
                    <Text style={styles.cropName}>{crop.cropName}</Text>
                    {crop.variety && <Text style={styles.cropVariety}>({crop.variety})</Text>}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
                      <Text style={styles.statusText}>{crop.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cropLocation}>{crop.fieldLocation}</Text>
                  <Text style={styles.cropSize}>{crop.fieldSize} acres</Text>
                  <View style={styles.cropFooter}>
                    <Text style={styles.cropDate}>
                      Planted: {crop.plantingDate.toLocaleDateString()}
                    </Text>
                    <Text style={styles.cropDate}>
                      Harvest: {crop.harvestDate.toLocaleDateString()}
                    </Text>
                  </View>
                  {crop.notes && (
                    <Text style={styles.cropNotes}>{crop.notes}</Text>
                  )}
                </View>
              ))
          )}
          {state.crops.length > 10 && (
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => setSelectedTab('crops')}
            >
              <Text style={styles.viewMoreText}>
                {translate('View All')} ({state.crops.length} {translate('total')})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* All Activities History */}
        <View style={styles.historySubSection}>
          <Text style={styles.historySubTitle}>{translate('All Activities History')}</Text>
          {state.activities.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={32} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>{translate('No activities in history')}</Text>
            </View>
          ) : (
            state.activities
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 15)
              .map((activity) => (
                <View key={activity.id} style={[styles.activityCard, styles.historyCard]}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityType}>{activity.activityType}</Text>
                    <Text style={styles.activityDate}>
                      {activity.date.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  {activity.cropName && (
                    <Text style={styles.activityCrop}>Crop: {activity.cropName}</Text>
                  )}
                </View>
              ))
          )}
          {state.activities.length > 15 && (
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>
                {translate('View All')} ({state.activities.length} {translate('total')})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderTasksTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translate('All Tasks')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/scheduling/add-task' as any)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        {upcomingTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={48} color={colors.success} />
            <Text style={styles.emptyStateText}>{translate('No tasks found')}</Text>
          </View>
        ) : (
          upcomingTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <View style={[styles.priorityIndicator, { backgroundColor: getTaskPriorityColor(task.priority) }]} />
                <Text style={styles.taskTitle}>{task.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusText}>{task.status}</Text>
                </View>
              </View>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <View style={styles.taskFooter}>
                <Text style={styles.taskDate}>
                  {task.scheduledDate.toLocaleDateString()}
                </Text>
                <Text style={styles.taskDuration}>
                  {task.estimatedDuration}h
                </Text>
              </View>
              {task.status === 'pending' && (
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={() => {
                    Alert.alert(
                      'Complete Task',
                      `Mark "${task.title}" as completed?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Complete', 
                          onPress: async () => {
                            try {
                              // Update task status to completed
                              await updateTask(task.id, { status: 'completed' });
                              Alert.alert('Success', 'Task marked as completed');
                              // Refresh dashboard to show updated data
                              await refreshDashboard();
                            } catch (error) {
                              console.error('Error completing task:', error);
                              Alert.alert('Error', 'Failed to complete task');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.completeButtonText}>{translate('Mark Complete')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderCropsTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translate('All Crops')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/scheduling/add-crop' as any)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        {activeCrops.length === 0 ? (
          <View style={styles.emptyState}>
            <Activity size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>{translate('No crops found')}</Text>
          </View>
        ) : (
          activeCrops.map((crop) => (
            <View key={crop.id} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropName}>{crop.cropName}</Text>
                {crop.variety && <Text style={styles.cropVariety}>({crop.variety})</Text>}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(crop.status) }]}>
                  <Text style={styles.statusText}>{crop.status}</Text>
                </View>
              </View>
              <Text style={styles.cropLocation}>{crop.fieldLocation}</Text>
              <Text style={styles.cropSize}>{crop.fieldSize} acres</Text>
              <View style={styles.cropFooter}>
                <Text style={styles.cropDate}>
                  Planted: {crop.plantingDate.toLocaleDateString()}
                </Text>
                <Text style={styles.cropDate}>
                  Harvest: {crop.harvestDate.toLocaleDateString()}
                </Text>
              </View>
              {crop.notes && (
                <Text style={styles.cropNotes}>{crop.notes}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderCalendarTab = () => (
    <ScrollView 
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{translate('Calendar View')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/scheduling/calendar' as any)}
          >
            <Calendar size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Calendar size={48} color={colors.textSecondary} />
          <Text style={styles.emptyStateText}>
            {translate('Tap the calendar icon to view full calendar')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title={translate('Smart Scheduling')}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
            {translate('Overview')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'tasks' && styles.activeTab]}
          onPress={() => setSelectedTab('tasks')}
        >
          <Text style={[styles.tabText, selectedTab === 'tasks' && styles.activeTabText]}>
            {translate('Tasks')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'crops' && styles.activeTab]}
          onPress={() => setSelectedTab('crops')}
        >
          <Text style={[styles.tabText, selectedTab === 'crops' && styles.activeTabText]}>
            {translate('Crops')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'calendar' && styles.activeTab]}
          onPress={() => setSelectedTab('calendar')}
        >
          <Text style={[styles.tabText, selectedTab === 'calendar' && styles.activeTabText]}>
            {translate('Calendar')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'tasks' && renderTasksTab()}
      {selectedTab === 'crops' && renderCropsTab()}
      {selectedTab === 'calendar' && renderCalendarTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  alertCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.error,
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.error + '20',
  },
  alertMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  alertDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskDuration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cropCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cropName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginRight: 4,
  },
  cropVariety: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
  },
  cropLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cropSize: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  cropFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cropDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  cropNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  activityCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityCrop: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 50,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeButtonText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyStatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyStatCard: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 4,
  },
  historyStatLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  historySubSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  historySubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  historyCard: {
    opacity: 0.9,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completedText: {
    fontSize: 12,
    color: colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  viewMoreButton: {
    backgroundColor: colors.lightBackground,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
});
