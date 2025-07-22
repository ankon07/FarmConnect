import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useScheduling } from '../../context/SchedulingContext';
import { useTranslation } from '../../hooks/useTranslation';
import { COLORS as colors } from '../../constants/colors';
import AppHeader from '../../components/common/AppHeader';
import { Plus, Calendar as CalendarIcon, Clock, Leaf, AlertTriangle } from 'lucide-react-native';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'task' | 'crop' | 'reminder';
  date: string;
  priority?: string;
  status?: string;
}

export default function CalendarScreen() {
  const router = useRouter();
  const { t: translate } = useTranslation();
  const { upcomingTasks, activeCrops, pendingReminders } = useScheduling();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarEvents, setCalendarEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    generateCalendarEvents();
  }, [upcomingTasks, activeCrops, pendingReminders]);

  const generateCalendarEvents = () => {
    const events: { [key: string]: CalendarEvent[] } = {};
    const marked: any = {};

    // Add tasks
    upcomingTasks.forEach(task => {
      const dateKey = task.scheduledDate.toISOString().split('T')[0];
      if (!events[dateKey]) events[dateKey] = [];
      
      events[dateKey].push({
        id: task.id,
        title: task.title,
        type: 'task',
        date: dateKey,
        priority: task.priority,
        status: task.status,
      });

      marked[dateKey] = {
        ...marked[dateKey],
        marked: true,
        dotColor: getPriorityColor(task.priority),
      };
    });

    // Add crop events
    activeCrops.forEach(crop => {
      // Planting date
      const plantingDateKey = crop.plantingDate.toISOString().split('T')[0];
      if (!events[plantingDateKey]) events[plantingDateKey] = [];
      
      events[plantingDateKey].push({
        id: `${crop.id}-planting`,
        title: `Plant ${crop.cropName}`,
        type: 'crop',
        date: plantingDateKey,
      });

      marked[plantingDateKey] = {
        ...marked[plantingDateKey],
        marked: true,
        dotColor: colors.success,
      };

      // Harvest date
      const harvestDateKey = crop.harvestDate.toISOString().split('T')[0];
      if (!events[harvestDateKey]) events[harvestDateKey] = [];
      
      events[harvestDateKey].push({
        id: `${crop.id}-harvest`,
        title: `Harvest ${crop.cropName}`,
        type: 'crop',
        date: harvestDateKey,
      });

      marked[harvestDateKey] = {
        ...marked[harvestDateKey],
        marked: true,
        dotColor: colors.warning,
      };
    });

    // Add reminders
    pendingReminders.forEach(reminder => {
      const dateKey = reminder.scheduledDate.toISOString().split('T')[0];
      if (!events[dateKey]) events[dateKey] = [];
      
      events[dateKey].push({
        id: reminder.id,
        title: reminder.title,
        type: 'reminder',
        date: dateKey,
      });

      marked[dateKey] = {
        ...marked[dateKey],
        marked: true,
        dotColor: colors.info,
      };
    });

    // Mark selected date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: colors.primary,
    };

    setCalendarEvents(events);
    setMarkedDates(marked);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.primary;
      case 'low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'task': return <Clock size={16} color={colors.primary} />;
      case 'crop': return <Leaf size={16} color={colors.success} />;
      case 'reminder': return <AlertTriangle size={16} color={colors.warning} />;
      default: return <CalendarIcon size={16} color={colors.textSecondary} />;
    }
  };

  const onDayPress = (day: any) => {
    const newSelectedDate = day.dateString;
    setSelectedDate(newSelectedDate);
    
    // Update marked dates to show new selection
    const newMarkedDates = { ...markedDates };
    
    // Remove previous selection
    Object.keys(newMarkedDates).forEach(date => {
      if (newMarkedDates[date].selected) {
        delete newMarkedDates[date].selected;
        delete newMarkedDates[date].selectedColor;
      }
    });
    
    // Add new selection
    newMarkedDates[newSelectedDate] = {
      ...newMarkedDates[newSelectedDate],
      selected: true,
      selectedColor: colors.primary,
    };
    
    setMarkedDates(newMarkedDates);
  };

  const selectedDateEvents = calendarEvents[selectedDate] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppHeader title={translate('Calendar')} />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            Alert.alert(
              'Add Event',
              'What would you like to add?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add Task', onPress: () => router.push('/scheduling/add-task' as any) },
                { text: 'Add Crop', onPress: () => router.push('/scheduling/add-crop' as any) },
              ]
            );
          }}
        >
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.white,
              calendarBackground: colors.white,
              textSectionTitleColor: colors.textPrimary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.textPrimary,
              textDisabledColor: colors.textSecondary,
              dotColor: colors.primary,
              selectedDotColor: colors.white,
              arrowColor: colors.primary,
              disabledArrowColor: colors.textSecondary,
              monthTextColor: colors.textPrimary,
              indicatorColor: colors.primary,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>{translate('Legend')}</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>{translate('Tasks')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={styles.legendText}>{translate('Planting')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
              <Text style={styles.legendText}>{translate('Harvest')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.info }]} />
              <Text style={styles.legendText}>{translate('Reminders')}</Text>
            </View>
          </View>
        </View>

        {/* Selected Date Events */}
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>
            {translate('Events for')} {new Date(selectedDate).toLocaleDateString()}
          </Text>
          
          {selectedDateEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarIcon size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {translate('No events scheduled for this date')}
              </Text>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => {
                  Alert.alert(
                    'Add Event',
                    'What would you like to add for this date?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Add Task', onPress: () => router.push('/scheduling/add-task' as any) },
                      { text: 'Add Crop', onPress: () => router.push('/scheduling/add-crop' as any) },
                    ]
                  );
                }}
              >
                <Text style={styles.addEventButtonText}>{translate('Add Event')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedDateEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  {getEventIcon(event.type)}
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  {event.priority && (
                    <View style={[
                      styles.priorityBadge, 
                      { backgroundColor: getPriorityColor(event.priority) }
                    ]}>
                      <Text style={styles.priorityText}>{event.priority}</Text>
                    </View>
                  )}
                  {event.status && (
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(event.status) }
                    ]}>
                      <Text style={styles.statusText}>{event.status}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.eventType}>
                  {translate(event.type.charAt(0).toUpperCase() + event.type.slice(1))}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>{translate('Quick Actions')}</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/scheduling/add-task' as any)}
            >
              <Clock size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>{translate('Add Task')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/scheduling/add-crop' as any)}
            >
              <Leaf size={24} color={colors.success} />
              <Text style={styles.quickActionText}>{translate('Add Crop')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return colors.success;
    case 'in_progress': return colors.warning;
    case 'overdue': return colors.error;
    case 'pending': return colors.primary;
    default: return colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 12,
  },
  legendContainer: {
    backgroundColor: colors.white,
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  eventsContainer: {
    margin: 16,
    marginTop: 0,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addEventButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addEventButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  eventType: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    margin: 16,
    marginTop: 0,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
