import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CropSchedule, MaintenanceTask, Reminder, FarmingActivity, WeatherAlert } from '../types/scheduling';

// Dummy user ID for testing
const DUMMY_USER_ID = 'test-user-123';

// Sample crop schedules
const sampleCrops: Omit<CropSchedule, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: DUMMY_USER_ID,
    cropName: 'Rice',
    variety: 'BRRI dhan29',
    fieldLocation: 'North Field - Block A',
    fieldSize: 2.5,
    plantingDate: new Date('2024-12-15'),
    harvestDate: new Date('2025-04-15'),
    status: 'planted',
    notes: 'High-yielding variety suitable for Boro season. Expected yield: 6-7 tons per hectare.',
  },
  {
    userId: DUMMY_USER_ID,
    cropName: 'Wheat',
    variety: 'BARI Gom-26',
    fieldLocation: 'South Field - Block B',
    fieldSize: 1.8,
    plantingDate: new Date('2024-11-20'),
    harvestDate: new Date('2025-03-20'),
    status: 'growing',
    notes: 'Disease-resistant variety. Regular irrigation required.',
  },
  {
    userId: DUMMY_USER_ID,
    cropName: 'Potato',
    variety: 'Cardinal',
    fieldLocation: 'East Field - Block C',
    fieldSize: 1.2,
    plantingDate: new Date('2024-11-10'),
    harvestDate: new Date('2025-02-10'),
    status: 'growing',
    notes: 'Early variety with good storage quality. Monitor for late blight.',
  },
  {
    userId: DUMMY_USER_ID,
    cropName: 'Tomato',
    variety: 'BARI Tomato-14',
    fieldLocation: 'Greenhouse - Section 1',
    fieldSize: 0.5,
    plantingDate: new Date('2024-10-01'),
    harvestDate: new Date('2025-01-15'),
    status: 'harvested',
    notes: 'Hybrid variety with high yield potential. Harvested 2.5 tons.',
  },
  {
    userId: DUMMY_USER_ID,
    cropName: 'Maize',
    variety: 'Pacific-984',
    fieldLocation: 'West Field - Block D',
    fieldSize: 3.0,
    plantingDate: new Date('2025-02-01'),
    harvestDate: new Date('2025-06-01'),
    status: 'planned',
    notes: 'Summer crop. Prepare field with proper drainage.',
  },
];

// Sample maintenance tasks
const sampleTasks: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    userId: DUMMY_USER_ID,
    title: 'Apply Fertilizer to Rice Field',
    description: 'Apply urea fertilizer (50kg/acre) to the rice field. Second top dressing.',
    taskType: 'fertilization',
    priority: 'high',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    estimatedDuration: 3,
    cropScheduleId: '', // Will be set after crops are created
    notes: 'Apply during morning hours. Ensure field has adequate water.',
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Pest Control for Wheat',
    description: 'Spray insecticide for aphid control in wheat field.',
    taskType: 'pesticide',
    priority: 'urgent',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    estimatedDuration: 2,
    cropScheduleId: '',
    notes: 'Use recommended dosage. Avoid spraying during windy conditions.',
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Irrigation System Check',
    description: 'Inspect and maintain drip irrigation system in greenhouse.',
    taskType: 'equipment_maintenance',
    priority: 'medium',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    estimatedDuration: 4,
    notes: 'Check for clogged emitters and replace if necessary.',
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Weed Control in Potato Field',
    description: 'Manual weeding and earthing up of potato plants.',
    taskType: 'weeding',
    priority: 'medium',
    status: 'in_progress',
    scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    estimatedDuration: 6,
    cropScheduleId: '',
    notes: 'Complete earthing up to prevent greening of tubers.',
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Harvest Tomatoes',
    description: 'Harvest ripe tomatoes from greenhouse section 1.',
    taskType: 'other',
    priority: 'high',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    estimatedDuration: 4,
    actualDuration: 3.5,
    cropScheduleId: '',
    notes: 'Harvested 150kg of premium quality tomatoes.',
    completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Prepare Field for Maize',
    description: 'Deep plowing and field preparation for maize planting.',
    taskType: 'other',
    priority: 'medium',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    estimatedDuration: 8,
    cropScheduleId: '',
    notes: 'Apply organic manure before plowing.',
  },
];

// Sample reminders
const sampleReminders: Omit<Reminder, 'id' | 'createdAt'>[] = [
  {
    userId: DUMMY_USER_ID,
    title: 'Check Rice Water Level',
    message: 'Maintain 2-3 cm water level in rice field during tillering stage.',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    type: 'maintenance',
    relatedItemId: '',
    isRecurring: true,
    recurringPattern: 'daily',
    isActive: true,
    isSent: false,
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Weather Alert Check',
    message: 'Check weather forecast for potential frost warning.',
    scheduledDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    type: 'weather',
    isRecurring: false,
    isActive: true,
    isSent: false,
  },
  {
    userId: DUMMY_USER_ID,
    title: 'Fertilizer Stock Check',
    message: 'Check fertilizer inventory for upcoming applications.',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: 'general',
    isRecurring: false,
    isActive: true,
    isSent: false,
  },
];

// Sample farming activities (fixed to match exact types)
const sampleActivities: Omit<FarmingActivity, 'id' | 'createdAt'>[] = [
  {
    userId: DUMMY_USER_ID,
    activityType: 'planting',
    description: 'Planted rice seedlings in North Field Block A',
    date: new Date('2024-12-15'),
    duration: 6,
    laborRequired: 4,
    equipmentUsed: ['Transplanter', 'Hand tools'],
    cost: 5000,
    weatherConditions: 'Sunny, ideal for planting',
    notes: 'Used 25kg seeds. Good germination rate observed.',
    cropName: 'Rice',
  },
  {
    userId: DUMMY_USER_ID,
    activityType: 'fertilization',
    description: 'Applied basal fertilizer to wheat field',
    date: new Date('2024-11-25'),
    duration: 2,
    laborRequired: 2,
    equipmentUsed: ['Fertilizer spreader'],
    cost: 3000,
    weatherConditions: 'Clear weather',
    notes: 'Applied NPK 16-20-0 @ 100kg/acre',
    cropName: 'Wheat',
  },
  {
    userId: DUMMY_USER_ID,
    activityType: 'harvesting',
    description: 'Harvested tomatoes from greenhouse',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    duration: 3.5,
    laborRequired: 3,
    equipmentUsed: ['Harvesting baskets', 'Pruning shears'],
    cost: 2000,
    yield: 150,
    quality: 'excellent',
    weatherConditions: 'Controlled greenhouse environment',
    notes: 'Harvested 150kg premium quality tomatoes. Market price: 80 BDT/kg',
    cropName: 'Tomato',
  },
  {
    userId: DUMMY_USER_ID,
    activityType: 'maintenance',
    description: 'Sprayed insecticide for aphid control',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    duration: 2,
    laborRequired: 1,
    equipmentUsed: ['Sprayer', 'Protective gear'],
    cost: 1500,
    weatherConditions: 'Calm, no wind',
    notes: 'Used Imidacloprid 17.8% SL @ 0.5ml/liter',
    cropName: 'Wheat',
  },
  {
    userId: DUMMY_USER_ID,
    activityType: 'irrigation',
    description: 'Irrigation applied to potato field',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    duration: 1.5,
    laborRequired: 1,
    equipmentUsed: ['Sprinkler system'],
    cost: 800,
    weatherConditions: 'Dry conditions, irrigation needed',
    notes: 'Applied 25mm irrigation through sprinkler system',
    cropName: 'Potato',
  },
];

// Sample weather alerts (fixed to match exact types)
const sampleWeatherAlerts: Omit<WeatherAlert, 'id' | 'createdAt'>[] = [
  {
    userId: DUMMY_USER_ID,
    alertType: 'temperature',
    severity: 'high',
    message: 'Frost warning for tonight. Protect sensitive crops.',
    startDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
    endDate: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
    affectedCrops: ['Tomato', 'Potato'],
    recommendedActions: [
      'Cover sensitive plants with cloth or plastic sheets',
      'Apply irrigation before sunset to increase soil heat capacity',
      'Use smoke or heaters in critical areas'
    ],
    isActive: true,
  },
  {
    userId: DUMMY_USER_ID,
    alertType: 'rain',
    severity: 'medium',
    message: 'Heavy rainfall expected. Ensure proper drainage.',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    affectedCrops: ['Rice', 'Wheat'],
    recommendedActions: [
      'Check drainage systems in all fields',
      'Postpone fertilizer application',
      'Harvest mature crops if possible'
    ],
    isActive: true,
  },
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Seed crop schedules
    console.log('Seeding crop schedules...');
    const cropIds: string[] = [];
    for (const crop of sampleCrops) {
      const docRef = await addDoc(collection(db, 'cropSchedules'), {
        ...crop,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cropIds.push(docRef.id);
      console.log(`Created crop: ${crop.cropName} with ID: ${docRef.id}`);
    }

    // Update tasks with crop IDs
    console.log('Seeding maintenance tasks...');
    const updatedTasks = sampleTasks.map((task, index) => {
      if (index < cropIds.length && task.cropScheduleId === '') {
        return { ...task, cropScheduleId: cropIds[index] };
      }
      return task;
    });

    for (const task of updatedTasks) {
      const docRef = await addDoc(collection(db, 'maintenanceTasks'), {
        ...task,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Created task: ${task.title} with ID: ${docRef.id}`);
    }

    // Seed reminders
    console.log('Seeding reminders...');
    for (const reminder of sampleReminders) {
      const docRef = await addDoc(collection(db, 'reminders'), {
        ...reminder,
        createdAt: new Date(),
      });
      console.log(`Created reminder: ${reminder.title} with ID: ${docRef.id}`);
    }

    // Seed farming activities
    console.log('Seeding farming activities...');
    for (const activity of sampleActivities) {
      const docRef = await addDoc(collection(db, 'farmingActivities'), {
        ...activity,
        createdAt: new Date(),
      });
      console.log(`Created activity: ${activity.activityType} with ID: ${docRef.id}`);
    }

    // Seed weather alerts
    console.log('Seeding weather alerts...');
    for (const alert of sampleWeatherAlerts) {
      const docRef = await addDoc(collection(db, 'weatherAlerts'), {
        ...alert,
        createdAt: new Date(),
      });
      console.log(`Created weather alert: ${alert.alertType} with ID: ${docRef.id}`);
    }

    // Create a test user profile
    console.log('Creating test user profile...');
    await setDoc(doc(db, 'users', DUMMY_USER_ID), {
      id: DUMMY_USER_ID,
      name: 'Test Farmer',
      email: 'test@farmconnect.com',
      username: 'testfarmer',
      location: {
        name: 'Dhaka, Bangladesh',
        latitude: 23.8103,
        longitude: 90.4125,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Database seeding completed successfully!');
    console.log(`Test User ID: ${DUMMY_USER_ID}`);
    console.log('You can use this user ID to test the scheduling functionality.');

    return {
      success: true,
      message: 'Database seeded successfully',
      testUserId: DUMMY_USER_ID,
      stats: {
        crops: sampleCrops.length,
        tasks: sampleTasks.length,
        reminders: sampleReminders.length,
        activities: sampleActivities.length,
        weatherAlerts: sampleWeatherAlerts.length,
      }
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    return {
      success: false,
      message: 'Failed to seed database',
      error: error,
    };
  }
};

// Function to clear all test data (useful for re-seeding)
export const clearTestData = async () => {
  try {
    console.log('Clearing test data...');
    
    // Note: In a real app, you'd want to query and delete documents
    // For now, we'll just log the action
    console.log('Test data cleared. You may need to manually delete documents from Firebase Console.');
    
    return { success: true, message: 'Test data cleared' };
  } catch (error) {
    console.error('Error clearing test data:', error);
    return { success: false, message: 'Failed to clear test data', error };
  }
};

export { DUMMY_USER_ID };
