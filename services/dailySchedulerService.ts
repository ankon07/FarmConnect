import AsyncStorage from '@react-native-async-storage/async-storage';
import { bamisScrapingService } from './bamisScrapingService';
import { notificationService } from './notificationService';

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron-like format or time string
  lastRun: Date | null;
  nextRun: Date;
  isActive: boolean;
  taskType: 'bamis_scraping' | 'notification_check' | 'data_cleanup';
}

class DailySchedulerService {
  private readonly SCHEDULER_STORAGE_KEY = 'daily_scheduler_tasks';
  private readonly SCHEDULER_STATUS_KEY = 'scheduler_status';
  private schedulerInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  async initialize(): Promise<void> {
    try {
      console.log('Initializing Daily Scheduler Service...');
      
      // Initialize default tasks if not exists
      await this.initializeDefaultTasks();
      
      // Start the scheduler
      await this.startScheduler();
      
      console.log('Daily Scheduler Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Daily Scheduler Service:', error);
    }
  }

  private async initializeDefaultTasks(): Promise<void> {
    try {
      const existingTasks = await this.getScheduledTasks();
      
      if (existingTasks.length === 0) {
        const defaultTasks: ScheduledTask[] = [
          {
            id: 'bamis_morning_scrape',
            name: 'BAMIS Morning Scrape',
            description: 'Daily morning scraping of BAMIS weather data',
            schedule: '08:00', // 8:00 AM
            lastRun: null,
            nextRun: this.calculateNextRun('08:00'),
            isActive: true,
            taskType: 'bamis_scraping'
          },
          {
            id: 'bamis_evening_scrape',
            name: 'BAMIS Evening Scrape',
            description: 'Daily evening scraping of BAMIS weather data',
            schedule: '18:00', // 6:00 PM
            lastRun: null,
            nextRun: this.calculateNextRun('18:00'),
            isActive: true,
            taskType: 'bamis_scraping'
          },
          {
            id: 'notification_check',
            name: 'Notification Check',
            description: 'Check for due notifications every 2 hours',
            schedule: '*/2h', // Every 2 hours
            lastRun: null,
            nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000), // Next 2 hours
            isActive: true,
            taskType: 'notification_check'
          },
          {
            id: 'data_cleanup',
            name: 'Data Cleanup',
            description: 'Clean up old cached data weekly',
            schedule: 'weekly_sunday_02:00', // Every Sunday at 2:00 AM
            lastRun: null,
            nextRun: this.calculateNextWeeklyRun(0, 2, 0), // Sunday, 2:00 AM
            isActive: true,
            taskType: 'data_cleanup'
          }
        ];

        await this.saveScheduledTasks(defaultTasks);
        console.log('Default scheduled tasks initialized');
      }
    } catch (error) {
      console.error('Error initializing default tasks:', error);
    }
  }

  private calculateNextRun(timeString: string): Date {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun;
  }

  private calculateNextWeeklyRun(dayOfWeek: number, hours: number, minutes: number): Date {
    const now = new Date();
    const nextRun = new Date();
    
    // Calculate days until next occurrence of the specified day
    const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
    
    nextRun.setDate(now.getDate() + daysUntilTarget);
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If it's the same day but time has passed, schedule for next week
    if (daysUntilTarget === 0 && nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 7);
    }
    
    return nextRun;
  }

  async startScheduler(): Promise<void> {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.isRunning = true;
    
    // Check for due tasks every minute
    this.schedulerInterval = setInterval(async () => {
      await this.checkAndExecuteDueTasks();
    }, 60 * 1000); // Check every minute

    // Mark scheduler as active
    await AsyncStorage.setItem(this.SCHEDULER_STATUS_KEY, JSON.stringify({
      isActive: true,
      startedAt: new Date().toISOString()
    }));

    console.log('Daily scheduler started');
  }

  async stopScheduler(): Promise<void> {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.isRunning = false;

    // Mark scheduler as inactive
    await AsyncStorage.setItem(this.SCHEDULER_STATUS_KEY, JSON.stringify({
      isActive: false,
      stoppedAt: new Date().toISOString()
    }));

    console.log('Daily scheduler stopped');
  }

  private async checkAndExecuteDueTasks(): Promise<void> {
    try {
      const tasks = await this.getScheduledTasks();
      const now = new Date();

      for (const task of tasks) {
        if (task.isActive && task.nextRun <= now) {
          console.log(`Executing scheduled task: ${task.name}`);
          
          try {
            await this.executeTask(task);
            
            // Update task after successful execution
            task.lastRun = now;
            task.nextRun = this.calculateNextRunForTask(task);
            
            console.log(`Task ${task.name} completed successfully. Next run: ${task.nextRun}`);
          } catch (error) {
            console.error(`Error executing task ${task.name}:`, error);
            
            // Schedule retry in 30 minutes
            task.nextRun = new Date(now.getTime() + 30 * 60 * 1000);
          }
        }
      }

      // Save updated tasks
      await this.saveScheduledTasks(tasks);
    } catch (error) {
      console.error('Error checking due tasks:', error);
    }
  }

  private async executeTask(task: ScheduledTask): Promise<void> {
    switch (task.taskType) {
      case 'bamis_scraping':
        await this.executeBamisScraping();
        break;
      
      case 'notification_check':
        await this.executeNotificationCheck();
        break;
      
      case 'data_cleanup':
        await this.executeDataCleanup();
        break;
      
      default:
        console.warn(`Unknown task type: ${task.taskType}`);
    }
  }

  private async executeBamisScraping(): Promise<void> {
    try {
      console.log('Executing BAMIS scraping task...');
      
      const bamisData = await bamisScrapingService.scrapeWeatherData();
      
      if (bamisData) {
        // Send notifications for new data
        await bamisScrapingService.sendNotifications(bamisData);
        console.log('BAMIS scraping and notifications completed');
      } else {
        console.log('No new BAMIS data to process');
      }
    } catch (error) {
      console.error('Error in BAMIS scraping task:', error);
      throw error;
    }
  }

  private async executeNotificationCheck(): Promise<void> {
    try {
      console.log('Executing notification check task...');
      
      // Check for any pending notifications or reminders
      // This could include checking user-specific reminders, etc.
      
      console.log('Notification check completed');
    } catch (error) {
      console.error('Error in notification check task:', error);
      throw error;
    }
  }

  private async executeDataCleanup(): Promise<void> {
    try {
      console.log('Executing data cleanup task...');
      
      // Clean up old cached data (older than 30 days)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);
      
      // This is a placeholder - implement actual cleanup logic based on your data structure
      console.log(`Cleaning up data older than ${cutoffDate.toISOString()}`);
      
      console.log('Data cleanup completed');
    } catch (error) {
      console.error('Error in data cleanup task:', error);
      throw error;
    }
  }

  private calculateNextRunForTask(task: ScheduledTask): Date {
    const now = new Date();
    
    switch (task.schedule) {
      case '*/2h': // Every 2 hours
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      case 'weekly_sunday_02:00': // Weekly on Sunday at 2:00 AM
        return this.calculateNextWeeklyRun(0, 2, 0);
      
      default:
        // Assume it's a time format like "08:00"
        if (task.schedule.includes(':')) {
          return this.calculateNextRun(task.schedule);
        }
        
        // Default to next day same time
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  async getScheduledTasks(): Promise<ScheduledTask[]> {
    try {
      const tasksData = await AsyncStorage.getItem(this.SCHEDULER_STORAGE_KEY);
      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        // Convert date strings back to Date objects
        return tasks.map((task: any) => ({
          ...task,
          lastRun: task.lastRun ? new Date(task.lastRun) : null,
          nextRun: new Date(task.nextRun)
        }));
      }
    } catch (error) {
      console.error('Error retrieving scheduled tasks:', error);
    }
    return [];
  }

  private async saveScheduledTasks(tasks: ScheduledTask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SCHEDULER_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving scheduled tasks:', error);
    }
  }

  async addTask(task: Omit<ScheduledTask, 'id' | 'lastRun' | 'nextRun'>): Promise<string> {
    try {
      const tasks = await this.getScheduledTasks();
      
      const newTask: ScheduledTask = {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        lastRun: null,
        nextRun: this.calculateNextRunForTask(task as ScheduledTask)
      };
      
      tasks.push(newTask);
      await this.saveScheduledTasks(tasks);
      
      console.log(`Added new scheduled task: ${newTask.name}`);
      return newTask.id;
    } catch (error) {
      console.error('Error adding scheduled task:', error);
      throw error;
    }
  }

  async removeTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getScheduledTasks();
      const filteredTasks = tasks.filter(task => task.id !== taskId);
      
      await this.saveScheduledTasks(filteredTasks);
      console.log(`Removed scheduled task: ${taskId}`);
    } catch (error) {
      console.error('Error removing scheduled task:', error);
      throw error;
    }
  }

  async toggleTask(taskId: string, isActive: boolean): Promise<void> {
    try {
      const tasks = await this.getScheduledTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        task.isActive = isActive;
        await this.saveScheduledTasks(tasks);
        console.log(`Task ${taskId} ${isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error('Error toggling scheduled task:', error);
      throw error;
    }
  }

  async getSchedulerStatus(): Promise<{ isActive: boolean; startedAt?: string; stoppedAt?: string }> {
    try {
      const statusData = await AsyncStorage.getItem(this.SCHEDULER_STATUS_KEY);
      if (statusData) {
        return JSON.parse(statusData);
      }
    } catch (error) {
      console.error('Error getting scheduler status:', error);
    }
    
    return { isActive: false };
  }

  async forceRunTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getScheduledTasks();
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        console.log(`Force running task: ${task.name}`);
        await this.executeTask(task);
        
        // Update last run time
        task.lastRun = new Date();
        await this.saveScheduledTasks(tasks);
        
        console.log(`Force run completed for task: ${task.name}`);
      } else {
        throw new Error(`Task not found: ${taskId}`);
      }
    } catch (error) {
      console.error('Error force running task:', error);
      throw error;
    }
  }
}

export const dailySchedulerService = new DailySchedulerService();
export default dailySchedulerService;
