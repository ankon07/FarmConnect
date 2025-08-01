import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import schedulingService from './schedulingService';
import { Reminder, MaintenanceTask } from '../types/scheduling';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private notificationIds: Map<string, string> = new Map();
  private isExpoGo: boolean = false;
  private fallbackReminders: Map<string, Reminder> = new Map();

  async initialize(): Promise<void> {
    try {
      // Check if running in Expo Go
      this.isExpoGo = Constants.appOwnership === 'expo';
      
      if (this.isExpoGo) {
        console.warn('Running in Expo Go - Push notifications are limited. Using fallback notification system.');
        this.initializeFallbackSystem();
        return;
      }

      // Request permissions for development builds
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted - using fallback system');
        this.initializeFallbackSystem();
        return;
      }

      // Configure notification channel for Android (development builds only)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('farming-reminders', {
          name: 'Farming Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });

        await Notifications.setNotificationChannelAsync('weather-alerts', {
          name: 'Weather Alerts',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FF9800',
        });

        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2196F3',
        });

        await Notifications.setNotificationChannelAsync('machinery-rental', {
          name: 'Machinery Rental',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });
      }

      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.initializeFallbackSystem();
    }
  }

  private initializeFallbackSystem(): void {
    console.log('Initializing fallback notification system');
    // Set up periodic check for due reminders
    setInterval(() => {
      this.checkFallbackReminders();
    }, 60000); // Check every minute
  }

  private async checkFallbackReminders(): Promise<void> {
    try {
      const now = new Date();
      for (const [id, reminder] of this.fallbackReminders) {
        if (reminder.scheduledDate <= now && !reminder.isSent) {
          // Show alert instead of push notification
          Alert.alert(
            reminder.title,
            reminder.message,
            [{ text: 'OK', onPress: () => this.markReminderAsSent(id) }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking fallback reminders:', error);
    }
  }

  private async markReminderAsSent(reminderId: string): Promise<void> {
    try {
      const reminder = this.fallbackReminders.get(reminderId);
      if (reminder) {
        reminder.isSent = true;
        this.fallbackReminders.set(reminderId, reminder);
        await schedulingService.markReminderAsSent(reminderId);
      }
    } catch (error) {
      console.error('Error marking reminder as sent:', error);
    }
  }

  async scheduleReminder(reminder: Reminder): Promise<string | null> {
    try {
      if (this.isExpoGo) {
        // Use fallback system for Expo Go
        this.fallbackReminders.set(reminder.id, reminder);
        console.log(`Scheduled fallback reminder: ${reminder.title}`);
        return reminder.id;
      }

      // Use native notifications for development builds
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.message,
          data: {
            reminderId: reminder.id,
            type: reminder.type,
            relatedItemId: reminder.relatedItemId,
          },
          categoryIdentifier: this.getCategoryForReminderType(reminder.type),
        },
        trigger: {
          date: reminder.scheduledDate,
        } as any,
      });

      this.notificationIds.set(reminder.id, notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
      // Fallback to in-memory system if native notifications fail
      this.fallbackReminders.set(reminder.id, reminder);
      return reminder.id;
    }
  }

  async sendImmediateNotification(
    title: string,
    body: string,
    data?: any,
    categoryIdentifier?: string
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          categoryIdentifier,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error sending immediate notification:', error);
      throw error;
    }
  }

  async cancelReminder(reminderId: string): Promise<void> {
    try {
      const notificationId = this.notificationIds.get(reminderId);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.notificationIds.delete(reminderId);
      }
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  }

  async checkAndSendDueReminders(userId: string): Promise<void> {
    try {
      const dueReminders = await schedulingService.getDueReminders(userId);
      
      for (const reminder of dueReminders) {
        await this.sendImmediateNotification(
          reminder.title,
          reminder.message,
          {
            reminderId: reminder.id,
            type: reminder.type,
            relatedItemId: reminder.relatedItemId,
          },
          this.getCategoryForReminderType(reminder.type)
        );

        await schedulingService.markReminderAsSent(reminder.id);
      }
    } catch (error) {
      console.error('Error checking and sending due reminders:', error);
    }
  }

  private getCategoryForReminderType(type: string): string {
    switch (type) {
      case 'planting':
      case 'harvesting':
        return 'farming-reminders';
      case 'maintenance':
        return 'task-reminders';
      case 'weather':
        return 'weather-alerts';
      case 'machinery-rental':
        return 'machinery-rental';
      default:
        return 'farming-reminders';
    }
  }

  // Machinery rental specific notifications
  async sendRentalRequestNotification(
    ownerId: string,
    machineryName: string,
    renterName: string,
    rentalId: string,
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      const title = 'New Rental Request';
      const body = `${renterName} wants to rent your ${machineryName} from ${startDate} to ${endDate}`;
      
      await this.sendImmediateNotification(
        title,
        body,
        {
          type: 'rental-request',
          rentalId,
          ownerId,
          machineryName,
          renterName,
        },
        'machinery-rental'
      );

      console.log(`Rental request notification sent to owner ${ownerId}`);
    } catch (error) {
      console.error('Error sending rental request notification:', error);
    }
  }

  async sendRentalStatusNotification(
    userId: string,
    machineryName: string,
    status: string,
    rentalId: string
  ): Promise<void> {
    try {
      let title = '';
      let body = '';

      switch (status) {
        case 'confirmed':
          title = 'Rental Confirmed';
          body = `Your rental request for ${machineryName} has been confirmed!`;
          break;
        case 'cancelled':
          title = 'Rental Cancelled';
          body = `Your rental request for ${machineryName} has been cancelled.`;
          break;
        case 'completed':
          title = 'Rental Completed';
          body = `Your rental of ${machineryName} has been completed. Please rate your experience.`;
          break;
        default:
          title = 'Rental Update';
          body = `Your rental of ${machineryName} status has been updated to ${status}.`;
      }

      await this.sendImmediateNotification(
        title,
        body,
        {
          type: 'rental-status',
          rentalId,
          status,
          machineryName,
        },
        'machinery-rental'
      );

      console.log(`Rental status notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending rental status notification:', error);
    }
  }

  async sendPaymentNotification(
    userId: string,
    machineryName: string,
    amount: number,
    paymentStatus: string,
    rentalId: string
  ): Promise<void> {
    try {
      let title = '';
      let body = '';

      switch (paymentStatus) {
        case 'paid':
          title = 'Payment Received';
          body = `Payment of ৳${amount} for ${machineryName} rental has been received.`;
          break;
        case 'failed':
          title = 'Payment Failed';
          body = `Payment of ৳${amount} for ${machineryName} rental has failed. Please try again.`;
          break;
        case 'refunded':
          title = 'Payment Refunded';
          body = `Payment of ৳${amount} for ${machineryName} rental has been refunded.`;
          break;
        default:
          title = 'Payment Update';
          body = `Payment status for ${machineryName} rental has been updated.`;
      }

      await this.sendImmediateNotification(
        title,
        body,
        {
          type: 'payment-update',
          rentalId,
          paymentStatus,
          amount,
          machineryName,
        },
        'machinery-rental'
      );

      console.log(`Payment notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending payment notification:', error);
    }
  }

  async sendRentalReminderNotification(
    userId: string,
    machineryName: string,
    reminderType: 'start' | 'end',
    rentalId: string,
    dateTime: string
  ): Promise<void> {
    try {
      let title = '';
      let body = '';

      if (reminderType === 'start') {
        title = 'Rental Starting Soon';
        body = `Your rental of ${machineryName} starts at ${dateTime}. Please be ready for pickup/delivery.`;
      } else {
        title = 'Rental Ending Soon';
        body = `Your rental of ${machineryName} ends at ${dateTime}. Please prepare for return.`;
      }

      await this.sendImmediateNotification(
        title,
        body,
        {
          type: 'rental-reminder',
          rentalId,
          reminderType,
          machineryName,
          dateTime,
        },
        'machinery-rental'
      );

      console.log(`Rental reminder notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending rental reminder notification:', error);
    }
  }

  async runBackgroundCheck(userId: string): Promise<void> {
    try {
      await this.checkAndSendDueReminders(userId);
    } catch (error) {
      console.error('Error running background notification check:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
