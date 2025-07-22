import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  CropSchedule, 
  MaintenanceTask, 
  Reminder, 
  SeasonalCalendar, 
  FarmingActivity,
  WeatherAlert,
  SchedulingPreferences,
  CropCalendarTemplate,
  ScheduleFilter,
  ScheduleSort
} from '../types/scheduling';

class SchedulingService {
  private readonly COLLECTIONS = {
    CROP_SCHEDULES: 'cropSchedules',
    MAINTENANCE_TASKS: 'maintenanceTasks',
    REMINDERS: 'reminders',
    SEASONAL_CALENDARS: 'seasonalCalendars',
    FARMING_ACTIVITIES: 'farmingActivities',
    WEATHER_ALERTS: 'weatherAlerts',
    SCHEDULING_PREFERENCES: 'schedulingPreferences',
    CROP_TEMPLATES: 'cropCalendarTemplates'
  };

  // Helper function to clean data before sending to Firebase
  private cleanFirebaseData(data: any): any {
    console.log('Cleaning Firebase data - Original:', data);
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      } else {
        console.log(`Filtering out field "${key}" with value:`, value);
      }
    }
    console.log('Cleaning Firebase data - Cleaned:', cleaned);
    return cleaned;
  }

  // Crop Schedule Management
  async createCropSchedule(cropSchedule: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      
      // Clean the crop data to remove undefined values
      const cleanedCrop = this.cleanFirebaseData(cropSchedule);
      
      const cropData = {
        ...cleanedCrop,
        plantingDate: Timestamp.fromDate(cropSchedule.plantingDate),
        harvestDate: Timestamp.fromDate(cropSchedule.harvestDate),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.CROP_SCHEDULES), cropData);

      // Auto-create maintenance reminders based on crop template
      await this.createMaintenanceRemindersForCrop(docRef.id, cropSchedule);

      return docRef.id;
    } catch (error) {
      console.error('Error creating crop schedule:', error);
      throw error;
    }
  }

  async updateCropSchedule(id: string, updates: Partial<CropSchedule>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.CROP_SCHEDULES, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert dates to Timestamps
      if (updates.plantingDate) {
        updateData.plantingDate = Timestamp.fromDate(updates.plantingDate);
      }
      if (updates.harvestDate) {
        updateData.harvestDate = Timestamp.fromDate(updates.harvestDate);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating crop schedule:', error);
      throw error;
    }
  }

  async deleteCropSchedule(id: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Delete the crop schedule
      const cropRef = doc(db, this.COLLECTIONS.CROP_SCHEDULES, id);
      batch.delete(cropRef);

      // Delete related maintenance tasks
      const maintenanceQuery = query(
        collection(db, this.COLLECTIONS.MAINTENANCE_TASKS),
        where('cropScheduleId', '==', id)
      );
      const maintenanceDocs = await getDocs(maintenanceQuery);
      maintenanceDocs.forEach(doc => batch.delete(doc.ref));

      // Delete related reminders
      const reminderQuery = query(
        collection(db, this.COLLECTIONS.REMINDERS),
        where('relatedItemId', '==', id)
      );
      const reminderDocs = await getDocs(reminderQuery);
      reminderDocs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();
    } catch (error) {
      console.error('Error deleting crop schedule:', error);
      throw error;
    }
  }

  async getCropSchedules(userId: string, filter?: ScheduleFilter, sort?: ScheduleSort): Promise<CropSchedule[]> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.CROP_SCHEDULES),
        where('userId', '==', userId)
      );

      // Apply filters
      if (filter?.status?.length) {
        q = query(q, where('status', 'in', filter.status));
      }

      // Apply sorting
      if (sort) {
        const sortField = sort.field === 'date' ? 'plantingDate' : sort.field;
        q = query(q, orderBy(sortField, sort.direction));
      } else {
        q = query(q, orderBy('plantingDate', 'asc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        plantingDate: doc.data().plantingDate.toDate(),
        harvestDate: doc.data().harvestDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as CropSchedule[];
    } catch (error) {
      console.error('Error getting crop schedules:', error);
      throw error;
    }
  }

  // Maintenance Task Management
  async createMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      
      // Clean the task data to remove undefined values
      const cleanedTask = this.cleanFirebaseData(task);
      
      const taskData = {
        ...cleanedTask,
        scheduledDate: Timestamp.fromDate(task.scheduledDate),
        completedDate: task.completedDate ? Timestamp.fromDate(task.completedDate) : null,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(db, this.COLLECTIONS.MAINTENANCE_TASKS), taskData);

      // Create reminder for this task
      await this.createReminderForTask(docRef.id, task);

      return docRef.id;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      throw error;
    }
  }

  async updateMaintenanceTask(id: string, updates: Partial<MaintenanceTask>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.MAINTENANCE_TASKS, id);
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      };

      // Convert dates to Timestamps
      if (updates.scheduledDate) {
        updateData.scheduledDate = Timestamp.fromDate(updates.scheduledDate);
      }
      if (updates.completedDate) {
        updateData.completedDate = Timestamp.fromDate(updates.completedDate);
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      throw error;
    }
  }

  async getMaintenanceTasks(userId: string, filter?: ScheduleFilter, sort?: ScheduleSort): Promise<MaintenanceTask[]> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.MAINTENANCE_TASKS),
        where('userId', '==', userId)
      );

      // Apply filters
      if (filter?.status?.length) {
        q = query(q, where('status', 'in', filter.status));
      }
      if (filter?.taskType?.length) {
        q = query(q, where('taskType', 'in', filter.taskType));
      }
      if (filter?.priority?.length) {
        q = query(q, where('priority', 'in', filter.priority));
      }

      // Apply sorting
      if (sort) {
        const sortField = sort.field === 'date' ? 'scheduledDate' : sort.field;
        q = query(q, orderBy(sortField, sort.direction));
      } else {
        q = query(q, orderBy('scheduledDate', 'asc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as MaintenanceTask[];
    } catch (error) {
      console.error('Error getting maintenance tasks:', error);
      throw error;
    }
  }

  async completeMaintenanceTask(id: string, actualDuration?: number, notes?: string): Promise<void> {
    try {
      const updates: Partial<MaintenanceTask> = {
        status: 'completed',
        completedDate: new Date(),
        actualDuration,
        notes
      };
      await this.updateMaintenanceTask(id, updates);
    } catch (error) {
      console.error('Error completing maintenance task:', error);
      throw error;
    }
  }

  // Reminder Management
  async createReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.REMINDERS), {
        ...reminder,
        scheduledDate: Timestamp.fromDate(reminder.scheduledDate),
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  }

  async getActiveReminders(userId: string): Promise<Reminder[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.REMINDERS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('isSent', '==', false),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Reminder[];
    } catch (error) {
      console.error('Error getting active reminders:', error);
      throw error;
    }
  }

  async getRemindersInRange(userId: string, startDate: Date, endDate: Date): Promise<Reminder[]> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.REMINDERS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('scheduledDate', '>=', Timestamp.fromDate(startDate)),
        where('scheduledDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Reminder[];
    } catch (error) {
      console.error('Error getting reminders in range:', error);
      throw error;
    }
  }

  async markReminderAsSent(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.REMINDERS, id);
      await updateDoc(docRef, { isSent: true });
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
      throw error;
    }
  }

  // Farming Activity Tracking
  async recordFarmingActivity(activity: Omit<FarmingActivity, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.FARMING_ACTIVITIES), {
        ...activity,
        date: Timestamp.fromDate(activity.date),
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error recording farming activity:', error);
      throw error;
    }
  }

  async getFarmingActivities(userId: string, dateRange?: { start: Date; end: Date }): Promise<FarmingActivity[]> {
    try {
      let q = query(
        collection(db, this.COLLECTIONS.FARMING_ACTIVITIES),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      if (dateRange) {
        q = query(
          q,
          where('date', '>=', Timestamp.fromDate(dateRange.start)),
          where('date', '<=', Timestamp.fromDate(dateRange.end))
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as FarmingActivity[];
    } catch (error) {
      console.error('Error getting farming activities:', error);
      throw error;
    }
  }

  // Weather Alert Management
  async createWeatherAlert(alert: Omit<WeatherAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTIONS.WEATHER_ALERTS), {
        ...alert,
        startDate: Timestamp.fromDate(alert.startDate),
        endDate: Timestamp.fromDate(alert.endDate),
        createdAt: Timestamp.fromDate(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating weather alert:', error);
      throw error;
    }
  }

  async getActiveWeatherAlerts(userId: string): Promise<WeatherAlert[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.COLLECTIONS.WEATHER_ALERTS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('endDate', '>=', Timestamp.fromDate(now)),
        orderBy('endDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as WeatherAlert[];
    } catch (error) {
      console.error('Error getting active weather alerts:', error);
      throw error;
    }
  }

  // Scheduling Preferences
  async saveSchedulingPreferences(preferences: SchedulingPreferences): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTIONS.SCHEDULING_PREFERENCES, preferences.userId);
      await updateDoc(docRef, preferences as any);
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await addDoc(collection(db, this.COLLECTIONS.SCHEDULING_PREFERENCES), preferences);
      } catch (createError) {
        console.error('Error saving scheduling preferences:', createError);
        throw createError;
      }
    }
  }

  async getSchedulingPreferences(userId: string): Promise<SchedulingPreferences | null> {
    try {
      const docRef = doc(db, this.COLLECTIONS.SCHEDULING_PREFERENCES, userId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return snapshot.data() as SchedulingPreferences;
      }
      return null;
    } catch (error) {
      console.error('Error getting scheduling preferences:', error);
      throw error;
    }
  }

  // Crop Calendar Templates
  async getCropCalendarTemplate(cropName: string, region: string): Promise<CropCalendarTemplate | null> {
    try {
      const q = query(
        collection(db, this.COLLECTIONS.CROP_TEMPLATES),
        where('cropName', '==', cropName),
        where('region', '==', region),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        } as CropCalendarTemplate;
      }
      return null;
    } catch (error) {
      console.error('Error getting crop calendar template:', error);
      throw error;
    }
  }

  // Calendar Integration Methods
  async getCalendarEvents(userId: string, startDate: Date, endDate: Date): Promise<{
    cropSchedules: CropSchedule[];
    maintenanceTasks: MaintenanceTask[];
    reminders: Reminder[];
  }> {
    try {
      const [cropSchedules, maintenanceTasks, reminders] = await Promise.all([
        this.getCropSchedules(userId, { 
          dateRange: { start: startDate, end: endDate } 
        }),
        this.getMaintenanceTasks(userId, { 
          dateRange: { start: startDate, end: endDate } 
        }),
        this.getRemindersInRange(userId, startDate, endDate)
      ]);

      return {
        cropSchedules,
        maintenanceTasks,
        reminders
      };
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  // Dashboard and Analytics
  async getDashboardData(userId: string): Promise<{
    upcomingTasks: MaintenanceTask[];
    activeCrops: CropSchedule[];
    recentActivities: FarmingActivity[];
    pendingReminders: Reminder[];
    weatherAlerts: WeatherAlert[];
  }> {
    try {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get upcoming tasks (next 7 days)
      const upcomingTasksQuery = query(
        collection(db, this.COLLECTIONS.MAINTENANCE_TASKS),
        where('userId', '==', userId),
        where('status', 'in', ['pending', 'in_progress']),
        where('scheduledDate', '>=', Timestamp.fromDate(now)),
        where('scheduledDate', '<=', Timestamp.fromDate(nextWeek)),
        orderBy('scheduledDate', 'asc'),
        limit(10)
      );

      // Get active crops
      const activeCropsQuery = query(
        collection(db, this.COLLECTIONS.CROP_SCHEDULES),
        where('userId', '==', userId),
        where('status', 'in', ['planted', 'growing']),
        orderBy('harvestDate', 'asc'),
        limit(10)
      );

      // Get recent activities (last 7 days)
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentActivitiesQuery = query(
        collection(db, this.COLLECTIONS.FARMING_ACTIVITIES),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(lastWeek)),
        orderBy('date', 'desc'),
        limit(10)
      );

      // Get pending reminders
      const pendingRemindersQuery = query(
        collection(db, this.COLLECTIONS.REMINDERS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('isSent', '==', false),
        where('scheduledDate', '<=', Timestamp.fromDate(nextWeek)),
        orderBy('scheduledDate', 'asc'),
        limit(5)
      );

      // Get active weather alerts
      const weatherAlertsQuery = query(
        collection(db, this.COLLECTIONS.WEATHER_ALERTS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('endDate', '>=', Timestamp.fromDate(now)),
        orderBy('severity', 'desc'),
        limit(5)
      );

      const [
        upcomingTasksSnapshot,
        activeCropsSnapshot,
        recentActivitiesSnapshot,
        pendingRemindersSnapshot,
        weatherAlertsSnapshot
      ] = await Promise.all([
        getDocs(upcomingTasksQuery),
        getDocs(activeCropsQuery),
        getDocs(recentActivitiesQuery),
        getDocs(pendingRemindersQuery),
        getDocs(weatherAlertsQuery)
      ]);

      return {
        upcomingTasks: upcomingTasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate.toDate(),
          completedDate: doc.data().completedDate?.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as MaintenanceTask[],
        
        activeCrops: activeCropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          plantingDate: doc.data().plantingDate.toDate(),
          harvestDate: doc.data().harvestDate.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate()
        })) as CropSchedule[],
        
        recentActivities: recentActivitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate()
        })) as FarmingActivity[],
        
        pendingReminders: pendingRemindersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate.toDate(),
          createdAt: doc.data().createdAt.toDate()
        })) as Reminder[],
        
        weatherAlerts: weatherAlertsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate(),
          createdAt: doc.data().createdAt.toDate()
        })) as WeatherAlert[]
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getProductivityAnalytics(userId: string, dateRange: { start: Date; end: Date }): Promise<{
    completedTasks: number;
    totalTasks: number;
    averageTaskDuration: number;
    cropYield: { cropName: string; totalYield: number; averageYield: number }[];
    costAnalysis: { totalCost: number; costByCategory: { [key: string]: number } };
  }> {
    try {
      const [tasks, activities] = await Promise.all([
        this.getMaintenanceTasks(userId, { dateRange }),
        this.getFarmingActivities(userId, dateRange)
      ]);

      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const totalTasks = tasks.length;
      
      const completedTasksWithDuration = tasks.filter(task => 
        task.status === 'completed' && task.actualDuration
      );
      const averageTaskDuration = completedTasksWithDuration.length > 0
        ? completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length
        : 0;

      // Crop yield analysis
      const harvestActivities = activities.filter(activity => 
        activity.activityType === 'harvesting' && activity.yield
      );
      const cropYieldMap = new Map<string, { totalYield: number; count: number }>();
      
      harvestActivities.forEach(activity => {
        if (activity.cropName && activity.yield) {
          const existing = cropYieldMap.get(activity.cropName) || { totalYield: 0, count: 0 };
          cropYieldMap.set(activity.cropName, {
            totalYield: existing.totalYield + activity.yield,
            count: existing.count + 1
          });
        }
      });

      const cropYield = Array.from(cropYieldMap.entries()).map(([cropName, data]) => ({
        cropName,
        totalYield: data.totalYield,
        averageYield: data.totalYield / data.count
      }));

      // Cost analysis
      const totalCost = activities.reduce((sum, activity) => sum + activity.cost, 0);
      const costByCategory: { [key: string]: number } = {};
      
      activities.forEach(activity => {
        const category = activity.activityType;
        costByCategory[category] = (costByCategory[category] || 0) + activity.cost;
      });

      return {
        completedTasks,
        totalTasks,
        averageTaskDuration,
        cropYield,
        costAnalysis: { totalCost, costByCategory }
      };
    } catch (error) {
      console.error('Error getting productivity analytics:', error);
      throw error;
    }
  }

  // Notification and Alert System
  async checkOverdueTasks(userId: string): Promise<MaintenanceTask[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.COLLECTIONS.MAINTENANCE_TASKS),
        where('userId', '==', userId),
        where('status', 'in', ['pending', 'in_progress']),
        where('scheduledDate', '<', Timestamp.fromDate(now)),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(q);
      const overdueTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as MaintenanceTask[];

      // Update status to overdue
      const batch = writeBatch(db);
      overdueTasks.forEach(task => {
        if (task.status !== 'overdue') {
          const taskRef = doc(db, this.COLLECTIONS.MAINTENANCE_TASKS, task.id);
          batch.update(taskRef, { status: 'overdue' });
        }
      });
      
      if (overdueTasks.length > 0) {
        await batch.commit();
      }

      return overdueTasks;
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
      throw error;
    }
  }

  async getDueReminders(userId: string): Promise<Reminder[]> {
    try {
      const now = new Date();
      const q = query(
        collection(db, this.COLLECTIONS.REMINDERS),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('isSent', '==', false),
        where('scheduledDate', '<=', Timestamp.fromDate(now)),
        orderBy('scheduledDate', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate.toDate(),
        createdAt: doc.data().createdAt.toDate()
      })) as Reminder[];
    } catch (error) {
      console.error('Error getting due reminders:', error);
      throw error;
    }
  }

  // Helper Methods
  private async createMaintenanceRemindersForCrop(cropScheduleId: string, cropSchedule: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      // Get crop template for maintenance schedule
      const template = await this.getCropCalendarTemplate(cropSchedule.cropName, 'default');
      
      if (template) {
        const reminders: Omit<Reminder, 'id' | 'createdAt'>[] = [];
        
        template.maintenanceSchedule.forEach((maintenance: any) => {
          const reminderDate = new Date(cropSchedule.plantingDate);
          reminderDate.setDate(reminderDate.getDate() + maintenance.daysAfterPlanting);
          
          reminders.push({
            title: `${maintenance.taskType} - ${cropSchedule.cropName}`,
            message: maintenance.description,
            type: 'maintenance',
            scheduledDate: reminderDate,
            isRecurring: false,
            isActive: true,
            isSent: false,
            relatedItemId: cropScheduleId,
            userId: cropSchedule.userId
          });
        });

        // Create harvest reminder
        const harvestReminderDate = new Date(cropSchedule.harvestDate);
        harvestReminderDate.setDate(harvestReminderDate.getDate() - 7); // 1 week before harvest
        
        reminders.push({
          title: `Harvest Ready - ${cropSchedule.cropName}`,
          message: `Your ${cropSchedule.cropName} crop will be ready for harvest in about a week. Start preparing for harvest activities.`,
          type: 'harvesting',
          scheduledDate: harvestReminderDate,
          isRecurring: false,
          isActive: true,
          isSent: false,
          relatedItemId: cropScheduleId,
          userId: cropSchedule.userId
        });

        // Batch create reminders
        const batch = writeBatch(db);
        reminders.forEach(reminder => {
          const docRef = doc(collection(db, this.COLLECTIONS.REMINDERS));
          batch.set(docRef, {
            ...reminder,
            scheduledDate: Timestamp.fromDate(reminder.scheduledDate),
            createdAt: Timestamp.fromDate(new Date())
          });
        });
        
        await batch.commit();
      }
    } catch (error) {
      console.error('Error creating maintenance reminders for crop:', error);
      // Don't throw error as this is a helper function
    }
  }

  private async createReminderForTask(taskId: string, task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const preferences = await this.getSchedulingPreferences(task.userId);
      const reminderTime = preferences?.defaultReminderTime || 24; // Default 24 hours before
      
      const reminderDate = new Date(task.scheduledDate);
      reminderDate.setHours(reminderDate.getHours() - reminderTime);
      
      const reminder: Omit<Reminder, 'id' | 'createdAt'> = {
        title: `Upcoming Task: ${task.title}`,
        message: `Don't forget about your scheduled task: ${task.description}`,
        type: 'maintenance',
        scheduledDate: reminderDate,
        isRecurring: false,
        isActive: true,
        isSent: false,
        relatedItemId: taskId,
        userId: task.userId
      };
      
      await this.createReminder(reminder);
    } catch (error) {
      console.error('Error creating reminder for task:', error);
      // Don't throw error as this is a helper function
    }
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
export default schedulingService;
