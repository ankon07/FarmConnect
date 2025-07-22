import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  CropSchedule, 
  MaintenanceTask, 
  Reminder, 
  FarmingActivity, 
  WeatherAlert,
  ScheduleFilter,
  ScheduleSort 
} from '../types/scheduling';
import { schedulingService } from '../services/schedulingService';
import { notificationService } from '../services/notificationService';
import { useUser } from './UserContext';

interface SchedulingState {
  crops: CropSchedule[];
  tasks: MaintenanceTask[];
  reminders: Reminder[];
  activities: FarmingActivity[];
  weatherAlerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  filter: ScheduleFilter;
  sort: ScheduleSort;
}

type SchedulingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CROPS'; payload: CropSchedule[] }
  | { type: 'SET_TASKS'; payload: MaintenanceTask[] }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'SET_ACTIVITIES'; payload: FarmingActivity[] }
  | { type: 'SET_WEATHER_ALERTS'; payload: WeatherAlert[] }
  | { type: 'ADD_CROP'; payload: CropSchedule }
  | { type: 'UPDATE_CROP'; payload: CropSchedule }
  | { type: 'DELETE_CROP'; payload: string }
  | { type: 'ADD_TASK'; payload: MaintenanceTask }
  | { type: 'UPDATE_TASK'; payload: MaintenanceTask }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: FarmingActivity }
  | { type: 'SET_FILTER'; payload: ScheduleFilter }
  | { type: 'SET_SORT'; payload: ScheduleSort }
  | { type: 'SET_DASHBOARD_DATA'; payload: any };

const initialState: SchedulingState = {
  crops: [],
  tasks: [],
  reminders: [],
  activities: [],
  weatherAlerts: [],
  loading: false,
  error: null,
  filter: {},
  sort: { field: 'date', direction: 'asc' },
};

function schedulingReducer(state: SchedulingState, action: SchedulingAction): SchedulingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CROPS':
      return { ...state, crops: action.payload, loading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload, loading: false };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload, loading: false };
    case 'SET_WEATHER_ALERTS':
      return { ...state, weatherAlerts: action.payload, loading: false };
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        crops: action.payload.activeCrops || state.crops,
        tasks: action.payload.upcomingTasks || state.tasks,
        reminders: action.payload.pendingReminders || state.reminders,
        activities: action.payload.recentActivities || state.activities,
        weatherAlerts: action.payload.weatherAlerts || state.weatherAlerts,
        loading: false,
      };
    case 'ADD_CROP':
      return { ...state, crops: [...state.crops, action.payload] };
    case 'UPDATE_CROP':
      return {
        ...state,
        crops: state.crops.map(crop =>
          crop.id === action.payload.id ? action.payload : crop
        ),
      };
    case 'DELETE_CROP':
      return {
        ...state,
        crops: state.crops.filter(crop => crop.id !== action.payload),
      };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(reminder =>
          reminder.id === action.payload.id ? action.payload : reminder
        ),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(reminder => reminder.id !== action.payload),
      };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    default:
      return state;
  }
}

interface SchedulingContextType {
  state: SchedulingState;
  
  // Crop operations
  createCropSchedule: (crop: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateCrop: (id: string, updates: Partial<CropSchedule>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  getCropById: (id: string) => CropSchedule | undefined;
  
  // Task operations
  createMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => MaintenanceTask | undefined;
  
  // Reminder operations
  createReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  
  // Activity operations
  createActivity: (activity: Omit<FarmingActivity, 'id' | 'createdAt'>) => Promise<void>;
  
  // Utility functions
  setFilter: (filter: ScheduleFilter) => void;
  setSort: (sort: ScheduleSort) => void;
  refreshData: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // Computed properties
  upcomingTasks: MaintenanceTask[];
  overdueTasks: MaintenanceTask[];
  todaysTasks: MaintenanceTask[];
  activeCrops: CropSchedule[];
  activeReminders: Reminder[];
  pendingReminders: Reminder[];
  recentActivities: FarmingActivity[];
  weatherAlerts: WeatherAlert[];
  isLoading: boolean;
}

const SchedulingContext = createContext<SchedulingContextType | undefined>(undefined);

export const SchedulingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(schedulingReducer, initialState);
  const { user } = useUser();

  // Initialize data when user changes
  useEffect(() => {
    if (user) {
      initializeData();
      setupNotifications();
    } else {
      // Clear data when user logs out
      dispatch({ type: 'SET_CROPS', payload: [] });
      dispatch({ type: 'SET_TASKS', payload: [] });
      dispatch({ type: 'SET_REMINDERS', payload: [] });
      dispatch({ type: 'SET_ACTIVITIES', payload: [] });
      dispatch({ type: 'SET_WEATHER_ALERTS', payload: [] });
    }
  }, [user]);

  const initializeData = async () => {
    if (!user) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Load dashboard data which includes all necessary information
      const dashboardData = await schedulingService.getDashboardData(user.id);
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
    } catch (error) {
      console.error('Error initializing scheduling data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load scheduling data' });
    }
  };

  const setupNotifications = async () => {
    try {
      await notificationService.initialize();
      if (user) {
        await notificationService.checkAndSendDueReminders(user.id);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  // Crop operations
  const createCropSchedule = async (cropData: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      console.log('Creating crop schedule with data:', cropData);
      console.log('User ID:', user.id);
      
      const fullCropData = {
        ...cropData,
        userId: user.id,
      };
      
      console.log('Full crop data being sent:', fullCropData);
      
      const cropId = await schedulingService.createCropSchedule(fullCropData);
      
      console.log('Crop created successfully with ID:', cropId);
      
      // Refresh data to get the new crop with all its properties
      await refreshData();
    } catch (error) {
      console.error('Error creating crop:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create crop schedule' });
      throw error;
    }
  };

  const updateCrop = async (id: string, updates: Partial<CropSchedule>) => {
    try {
      await schedulingService.updateCropSchedule(id, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating crop:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update crop schedule' });
      throw error;
    }
  };

  const deleteCrop = async (id: string) => {
    try {
      await schedulingService.deleteCropSchedule(id);
      dispatch({ type: 'DELETE_CROP', payload: id });
    } catch (error) {
      console.error('Error deleting crop:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete crop schedule' });
      throw error;
    }
  };

  const getCropById = (id: string): CropSchedule | undefined => {
    return state.crops.find(crop => crop.id === id);
  };

  // Task operations
  const createMaintenanceTask = async (taskData: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      console.log('Creating maintenance task with data:', taskData);
      console.log('User ID:', user.id);
      
      const fullTaskData = {
        ...taskData,
        userId: user.id,
      };
      
      console.log('Full task data being sent:', fullTaskData);
      
      const taskId = await schedulingService.createMaintenanceTask(fullTaskData);
      
      console.log('Task created successfully with ID:', taskId);
      
      // Refresh data to get the new task
      await refreshData();
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create maintenance task' });
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    try {
      await schedulingService.updateMaintenanceTask(id, updates);
      await refreshData();
    } catch (error) {
      console.error('Error updating task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update maintenance task' });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Note: schedulingService doesn't have deleteMaintenanceTask, so we'll use updateMaintenanceTask to mark as deleted
      await schedulingService.updateMaintenanceTask(id, { status: 'completed' });
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Error deleting task:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete maintenance task' });
      throw error;
    }
  };

  const getTaskById = (id: string): MaintenanceTask | undefined => {
    return state.tasks.find(task => task.id === id);
  };

  // Reminder operations
  const createReminder = async (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const reminderId = await schedulingService.createReminder({
        ...reminderData,
        userId: user.id,
      });
      
      // Schedule the notification
      const reminder = { ...reminderData, id: reminderId, createdAt: new Date() };
      await notificationService.scheduleReminder(reminder);
      
      await refreshData();
    } catch (error) {
      console.error('Error creating reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create reminder' });
      throw error;
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      // Note: schedulingService doesn't have updateReminder, so we'll handle this locally
      const existingReminder = state.reminders.find(r => r.id === id);
      if (existingReminder) {
        const updatedReminder = { ...existingReminder, ...updates };
        dispatch({ type: 'UPDATE_REMINDER', payload: updatedReminder });
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update reminder' });
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      // Cancel the notification
      await notificationService.cancelReminder(id);
      dispatch({ type: 'DELETE_REMINDER', payload: id });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete reminder' });
      throw error;
    }
  };

  // Activity operations
  const createActivity = async (activityData: Omit<FarmingActivity, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const activityId = await schedulingService.recordFarmingActivity({
        ...activityData,
        userId: user.id,
      });
      
      await refreshData();
    } catch (error) {
      console.error('Error creating activity:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create farming activity' });
      throw error;
    }
  };

  // Utility functions
  const setFilter = (filter: ScheduleFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const setSort = (sort: ScheduleSort) => {
    dispatch({ type: 'SET_SORT', payload: sort });
  };

  const refreshData = async () => {
    await initializeData();
  };

  const refreshDashboard = async () => {
    await initializeData();
  };

  // Computed properties
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const upcomingTasks = state.tasks.filter(task => 
    task.status === 'pending' && 
    new Date(task.scheduledDate) >= today &&
    new Date(task.scheduledDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const overdueTasks = state.tasks.filter(task => 
    task.status === 'pending' && 
    new Date(task.scheduledDate) < today
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const todaysTasks = state.tasks.filter(task => 
    task.status === 'pending' && 
    new Date(task.scheduledDate) >= today &&
    new Date(task.scheduledDate) < tomorrow
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const activeCrops = state.crops.filter(crop => 
    crop.status === 'planted' || crop.status === 'growing'
  ).sort((a, b) => new Date(a.harvestDate).getTime() - new Date(b.harvestDate).getTime());

  const activeReminders = state.reminders.filter(reminder => 
    reminder.isActive && !reminder.isSent
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const pendingReminders = activeReminders;

  const recentActivities = state.activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const weatherAlerts = state.weatherAlerts.filter(alert => alert.isActive);

  const contextValue: SchedulingContextType = {
    state,
    createCropSchedule,
    updateCrop,
    deleteCrop,
    getCropById,
    createMaintenanceTask,
    updateTask,
    deleteTask,
    getTaskById,
    createReminder,
    updateReminder,
    deleteReminder,
    createActivity,
    setFilter,
    setSort,
    refreshData,
    refreshDashboard,
    upcomingTasks,
    overdueTasks,
    todaysTasks,
    activeCrops,
    activeReminders,
    pendingReminders,
    recentActivities,
    weatherAlerts,
    isLoading: state.loading,
  };

  return (
    <SchedulingContext.Provider value={contextValue}>
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
