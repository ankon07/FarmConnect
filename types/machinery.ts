export interface Machinery {
  id: string;
  name: string;
  type: 'tractor' | 'harvester' | 'planter' | 'cultivator' | 'sprayer' | 'other';
  description: string;
  imageUrl: string;
  pricePerHour: number;
  pricePerDay: number;
  available: boolean;
  ownerId: string;
  ownerName: string;
  ownerContact: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  specifications: {
    brand?: string;
    model?: string;
    year?: number;
    horsepower?: number;
    fuelType?: 'diesel' | 'petrol' | 'electric';
    condition: 'excellent' | 'good' | 'fair' | 'poor';
  };
  availability: {
    startDate: string;
    endDate: string;
    unavailableDates: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface MachineryRental {
  id: string;
  machineryId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalDays: number;
  pricePerHour: number;
  pricePerDay: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'cash';
  transactionId?: string;
  notes?: string;
  deliveryAddress?: string;
  requiresDelivery: boolean;
  deliveryFee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  rentalId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'cash';
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInfo {
  method: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'cash';
  phoneNumber?: string;
  accountNumber?: string;
  transactionId?: string;
}

export interface RentalFormData {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes?: string;
  deliveryAddress?: string;
  requiresDelivery: boolean;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank_transfer' | 'cash';
  paymentInfo: PaymentInfo;
}
