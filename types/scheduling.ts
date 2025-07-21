export interface CropSchedule {
  id: string;
  cropName: string;
  variety?: string;
  plantingDate: Date;
  harvestDate: Date;
  fieldLocation: string;
  fieldSize: number; // in acres or hectares
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'completed';
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  taskType: 'irrigation' | 'fertilization' | 'pesticide' | 'weeding' | 'pruning' | 'soil_testing' | 'equipment_maintenance' | 'other';
  scheduledDate: Date;
  completedDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  cropScheduleId?: string; // Optional link to crop schedule
  fieldLocation?: string;
  estimatedDuration: number; // in hours
  actualDuration?: number;
  cost?: number;
  notes?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  type: 'planting' | 'harvesting' | 'maintenance' | 'weather' | 'market' | 'general';
  scheduledDate: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  isActive: boolean;
  isSent: boolean;
  relatedItemId?: string; // ID of related crop schedule or maintenance task
  userId: string;
  createdAt: Date;
}

export interface SeasonalCalendar {
  id: string;
  season: 'spring' | 'summer' | 'monsoon' | 'autumn' | 'winter';
  year: number;
  cropSchedules: string[]; // Array of crop schedule IDs
  maintenanceTasks: string[]; // Array of maintenance task IDs
  weatherConsiderations: string[];
  marketTrends: string[];
  userId: string;
}

export interface FarmingActivity {
  id: string;
  activityType: 'planting' | 'harvesting' | 'maintenance' | 'irrigation' | 'fertilization';
  cropName?: string;
  description: string;
  date: Date;
  duration: number; // in hours
  laborRequired: number; // number of people
  equipmentUsed: string[];
  cost: number;
  yield?: number; // for harvesting activities
  quality?: 'excellent' | 'good' | 'average' | 'poor';
  weatherConditions?: string;
  notes?: string;
  userId: string;
  createdAt: Date;
}

export interface WeatherAlert {
  id: string;
  alertType: 'rain' | 'drought' | 'storm' | 'temperature' | 'humidity' | 'wind';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  startDate: Date;
  endDate: Date;
  affectedCrops: string[]; // Array of crop schedule IDs
  recommendedActions: string[];
  isActive: boolean;
  userId: string;
  createdAt: Date;
}

export interface SchedulingPreferences {
  userId: string;
  defaultReminderTime: number; // hours before event
  notificationMethods: ('push' | 'sms' | 'email')[];
  workingHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  workingDays: number[]; // 0-6, Sunday to Saturday
  preferredLanguage: string;
  timezone: string;
  autoScheduleMaintenance: boolean;
  weatherAlertThreshold: 'low' | 'medium' | 'high';
}

export interface CropGrowthStage {
  stage: 'seed' | 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity' | 'harvest';
  startDate: Date;
  endDate: Date;
  description: string;
  requiredActions: string[];
  optimalConditions: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    rainfall: number; // mm per week
  };
}

export interface CropCalendarTemplate {
  id: string;
  cropName: string;
  variety: string;
  region: string;
  growthStages: CropGrowthStage[];
  totalGrowthDays: number;
  plantingSeasons: string[];
  maintenanceSchedule: {
    taskType: string;
    daysAfterPlanting: number;
    frequency?: number; // days between repetitions
    description: string;
  }[];
  harvestIndicators: string[];
  commonPests: string[];
  commonDiseases: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleFilter = {
  dateRange?: { start: Date; end: Date };
  status?: string[];
  cropType?: string[];
  taskType?: string[];
  priority?: string[];
  location?: string;
};

export type ScheduleSort = {
  field: 'date' | 'priority' | 'status' | 'cropName' | 'taskType';
  direction: 'asc' | 'desc';
};
