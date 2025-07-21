import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import schedulingService from '../services/schedulingService';
import { 
  CropSchedule, 
  MaintenanceTask, 
  Reminder, 
  FarmingActivity,
  WeatherAlert,
  SchedulingPreferences
} from '../types/scheduling';

interface SchedulingContextType {
  // Dashboard data
  upcomingTasks: MaintenanceTask[];
  activeCrops: CropSchedule[];
  recentActivities: FarmingActivity[];
  pendingReminders: Reminder[];
  weatherAlerts: WeatherAlert[];
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  refreshDashboard: () => Promise<void>;
  createCropSchedule: (cropSchedule: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCropSchedule: (id: string, updates: Partial<CropSchedule>) => Promise<void>;
  deleteCropSchedule: (id: string) => Promise<void>;
  createMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateMaintenanceTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  completeMaintenanceTask: (id: string, actualDuration?: number, notes?: string) => Promise<void>;
  recordFarmingActivity: (activity: Omit<FarmingActivity, 'id' | 'createdAt'>) => Promise<string>;
  markReminderAsSent: (id: string) => Promise<void>;
  
  // Preferences
  preferences: SchedulingPreferences | null;
  updatePreferences: (preferences: SchedulingPreferences) => Promise<void>;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export const SchedulingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [upcomingTasks, setUpcomingTasks] = useState<MaintenanceTask[]>([]);
  const [activeCrops, setActiveCrops] = useState<CropSchedule[]>([]);
  const [recentActivities, setRecentActivities] = useState<FarmingActivity[]>([]);
  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [preferences, setPreferences] = useState<SchedulingPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load dashboard data when user changes
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
      loadPreferences();
    } else {
      // Clear data when user logs out
      setUpcomingTasks([]);
      setActiveCrops([]);
      setRecentActivities([]);
      setPendingReminders([]);
      setWeatherAlerts([]);
      setPreferences(null);
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const dashboardData = await schedulingService.getDashboardData(user.id);
      
      setUpcomingTasks(dashboardData.upcomingTasks);
      setActiveCrops(dashboardData.activeCrops);
      setRecentActivities(dashboardData.recentActivities);
      setPendingReminders(dashboardData.pendingReminders);
      setWeatherAlerts(dashboardData.weatherAlerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const userPreferences = await schedulingService.getSchedulingPreferences(user.id);
      setPreferences(userPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const refreshDashboard = async () => {
    if (!user?.id) return;
    
    try {
      setIsRefreshing(true);
      await loadDashboardData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const createCropSchedule = async (cropSchedule: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const scheduleWithUser = { ...cropSchedule, userId: user.id };
    const id = await schedulingService.createCropSchedule(scheduleWithUser);
    
    // Refresh dashboard to show new crop
    await refreshDashboard();
    
    return id;
  };

  const updateCropSchedule = async (id: string, updates: Partial<CropSchedule>): Promise<void> => {
    await schedulingService.updateCropSchedule(id, updates);
    
    // Update local state
    setActiveCrops(prev => prev.map(crop => 
      crop.id === id ? { ...crop, ...updates } : crop
    ));
  };

  const deleteCropSchedule = async (id: string): Promise<void> => {
    await schedulingService.deleteCropSchedule(id);
    
    // Remove from local state
    setActiveCrops(prev => prev.filter(crop => crop.id !== id));
    setUpcomingTasks(prev => prev.filter(task => task.cropScheduleId !== id));
    setPendingReminders(prev => prev.filter(reminder => reminder.relatedItemId !== id));
  };

  const createMaintenanceTask = async (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const taskWithUser = { ...task, userId: user.id };
    const id = await schedulingService.createMaintenanceTask(taskWithUser);
    
    // Refresh dashboard to show new task
    await refreshDashboard();
    
    return id;
  };

  const updateMaintenanceTask = async (id: string, updates: Partial<MaintenanceTask>): Promise<void> => {
    await schedulingService.updateMaintenanceTask(id, updates);
    
    // Update local state
    setUpcomingTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const completeMaintenanceTask = async (id: string, actualDuration?: number, notes?: string): Promise<void> => {
    await schedulingService.completeMaintenanceTask(id, actualDuration, notes);
    
    // Remove from upcoming tasks
    setUpcomingTasks(prev => prev.filter(task => task.id !== id));
    
    // Refresh to update recent activities
    await refreshDashboard();
  };

  const recordFarmingActivity = async (activity: Omit<FarmingActivity, 'id' | 'createdAt'>): Promise<string> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const activityWithUser = { ...activity, userId: user.id };
    const id = await schedulingService.recordFarmingActivity(activityWithUser);
    
    // Add to recent activities
    const newActivity: FarmingActivity = {
      ...activityWithUser,
      id,
      createdAt: new Date()
    };
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    
    return id;
  };

  const markReminderAsSent = async (id: string): Promise<void> => {
    await schedulingService.markReminderAsSent(id);
    
    // Remove from pending reminders
    setPendingReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const updatePreferences = async (newPreferences: SchedulingPreferences): Promise<void> => {
    await schedulingService.saveSchedulingPreferences(newPreferences);
    setPreferences(newPreferences);
  };

  const value: SchedulingContextType = {
    upcomingTasks,
    activeCrops,
    recentActivities,
    pendingReminders,
    weatherAlerts,
    isLoading,
    isRefreshing,
    refreshDashboard,
    createCropSchedule,
    updateCropSchedule,
    deleteCropSchedule,
    createMaintenanceTask,
    updateMaintenanceTask,
    completeMaintenanceTask,
    recordFarmingActivity,
    markReminderAsSent,
    preferences,
    updatePreferences
  };

  return (
    <SchedulingContext.Provider value={value}>
      {children}
    </SchedulingContext.Provider>
  );
};

export const useScheduling = (): SchedulingContextType => {
  const context = useContext(SchedulingContext);
  if (context === undefined) {
    throw new Error('useScheduling must be used within a SchedulingProvider');
  }
  return context;
};
