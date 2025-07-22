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
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Machinery, MachineryRental, RentalFormData, Transaction } from '../types/machinery';
import { notificationService } from './notificationService';

const MACHINERY_COLLECTION = 'machinery';
const RENTALS_COLLECTION = 'machinery_rentals';
const TRANSACTIONS_COLLECTION = 'transactions';

// Machinery CRUD operations
export const addMachinery = async (machinery: Omit<Machinery, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const machineryData = {
      ...machinery,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, MACHINERY_COLLECTION), machineryData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding machinery:', error);
    throw new Error('Failed to add machinery');
  }
};

export const updateMachinery = async (id: string, updates: Partial<Machinery>): Promise<void> => {
  try {
    const machineryRef = doc(db, MACHINERY_COLLECTION, id);
    await updateDoc(machineryRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating machinery:', error);
    throw new Error('Failed to update machinery');
  }
};

export const deleteMachinery = async (id: string): Promise<void> => {
  try {
    const machineryRef = doc(db, MACHINERY_COLLECTION, id);
    await deleteDoc(machineryRef);
  } catch (error) {
    console.error('Error deleting machinery:', error);
    throw new Error('Failed to delete machinery');
  }
};

export const getMachinery = async (id: string): Promise<Machinery | null> => {
  try {
    const machineryRef = doc(db, MACHINERY_COLLECTION, id);
    const docSnap = await getDoc(machineryRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Machinery;
    }
    return null;
  } catch (error) {
    console.error('Error getting machinery:', error);
    throw new Error('Failed to get machinery');
  }
};

export const getUserMachinery = async (userId: string): Promise<Machinery[]> => {
  try {
    const q = query(
      collection(db, MACHINERY_COLLECTION),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const machinery: Machinery[] = [];
    
    querySnapshot.forEach((doc) => {
      machinery.push({ id: doc.id, ...doc.data() } as Machinery);
    });
    
    return machinery;
  } catch (error) {
    console.error('Error getting user machinery:', error);
    throw new Error('Failed to get user machinery');
  }
};

export const getAvailableMachinery = async (
  latitude?: number, 
  longitude?: number, 
  radius?: number
): Promise<Machinery[]> => {
  try {
    const q = query(
      collection(db, MACHINERY_COLLECTION),
      where('available', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const machinery: Machinery[] = [];
    
    querySnapshot.forEach((doc) => {
      machinery.push({ id: doc.id, ...doc.data() } as Machinery);
    });
    
    // If location is provided, we could implement distance filtering here
    // For now, return all available machinery
    return machinery;
  } catch (error) {
    console.error('Error getting available machinery:', error);
    throw new Error('Failed to get available machinery');
  }
};

// Rental operations
export const createRental = async (
  machineryId: string,
  renterId: string,
  rentalData: RentalFormData,
  renterName?: string
): Promise<string> => {
  try {
    // Get machinery details
    const machinery = await getMachinery(machineryId);
    if (!machinery) {
      throw new Error('Machinery not found');
    }
    
    // Calculate rental duration and cost
    const startDateTime = new Date(`${rentalData.startDate}T${rentalData.startTime}`);
    const endDateTime = new Date(`${rentalData.endDate}T${rentalData.endTime}`);
    
    const totalHours = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60));
    const totalDays = Math.ceil(totalHours / 24);
    
    // Calculate cost (prefer daily rate for longer rentals)
    let totalAmount = 0;
    if (totalHours <= 8) {
      totalAmount = totalHours * machinery.pricePerHour;
    } else {
      totalAmount = totalDays * machinery.pricePerDay;
    }
    
    // Add delivery fee if required
    if (rentalData.requiresDelivery) {
      totalAmount += 500; // Fixed delivery fee, could be dynamic based on distance
    }
    
    const rental: Omit<MachineryRental, 'id'> = {
      machineryId,
      renterId,
      ownerId: machinery.ownerId,
      startDate: rentalData.startDate,
      endDate: rentalData.endDate,
      startTime: rentalData.startTime,
      endTime: rentalData.endTime,
      totalHours,
      totalDays,
      pricePerHour: machinery.pricePerHour,
      pricePerDay: machinery.pricePerDay,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: rentalData.paymentMethod,
      notes: rentalData.notes,
      deliveryAddress: rentalData.deliveryAddress,
      requiresDelivery: rentalData.requiresDelivery,
      deliveryFee: rentalData.requiresDelivery ? 500 : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, RENTALS_COLLECTION), rental);
    const rentalId = docRef.id;
    
    // Create transaction record
    await createTransaction(rentalId, renterId, machinery.ownerId, totalAmount, rentalData);
    
    // Send notification to machinery owner
    try {
      await notificationService.sendRentalRequestNotification(
        machinery.ownerId,
        machinery.name,
        renterName || 'A user',
        rentalId,
        rentalData.startDate,
        rentalData.endDate
      );
    } catch (notificationError) {
      console.error('Error sending rental notification:', notificationError);
      // Don't fail the rental creation if notification fails
    }
    
    return rentalId;
  } catch (error) {
    console.error('Error creating rental:', error);
    throw new Error('Failed to create rental');
  }
};

export const updateRentalStatus = async (
  rentalId: string, 
  status: MachineryRental['status']
): Promise<void> => {
  try {
    const rentalRef = doc(db, RENTALS_COLLECTION, rentalId);
    await updateDoc(rentalRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    // Send notification to renter about status change
    try {
      const rental = await getRental(rentalId);
      if (rental) {
        const machinery = await getMachinery(rental.machineryId);
        if (machinery) {
          await notificationService.sendRentalStatusNotification(
            rental.renterId,
            machinery.name,
            status,
            rentalId
          );
        }
      }
    } catch (notificationError) {
      console.error('Error sending status notification:', notificationError);
      // Don't fail the status update if notification fails
    }
  } catch (error) {
    console.error('Error updating rental status:', error);
    throw new Error('Failed to update rental status');
  }
};

export const getUserRentals = async (userId: string): Promise<MachineryRental[]> => {
  try {
    const q = query(
      collection(db, RENTALS_COLLECTION),
      where('renterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const rentals: MachineryRental[] = [];
    
    querySnapshot.forEach((doc) => {
      rentals.push({ id: doc.id, ...doc.data() } as MachineryRental);
    });
    
    return rentals;
  } catch (error) {
    console.error('Error getting user rentals:', error);
    throw new Error('Failed to get user rentals');
  }
};

export const getOwnerRentals = async (ownerId: string): Promise<MachineryRental[]> => {
  try {
    const q = query(
      collection(db, RENTALS_COLLECTION),
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const rentals: MachineryRental[] = [];
    
    querySnapshot.forEach((doc) => {
      rentals.push({ id: doc.id, ...doc.data() } as MachineryRental);
    });
    
    return rentals;
  } catch (error) {
    console.error('Error getting owner rentals:', error);
    throw new Error('Failed to get owner rentals');
  }
};

export const getRental = async (rentalId: string): Promise<MachineryRental | null> => {
  try {
    const rentalRef = doc(db, RENTALS_COLLECTION, rentalId);
    const docSnap = await getDoc(rentalRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as MachineryRental;
    }
    return null;
  } catch (error) {
    console.error('Error getting rental:', error);
    throw new Error('Failed to get rental');
  }
};

// Transaction operations
export const createTransaction = async (
  rentalId: string,
  payerId: string,
  payeeId: string,
  amount: number,
  rentalData: RentalFormData
): Promise<string> => {
  try {
    const transaction: Omit<Transaction, 'id'> = {
      rentalId,
      payerId,
      payeeId,
      amount,
      paymentMethod: rentalData.paymentMethod,
      transactionId: rentalData.paymentInfo.transactionId,
      status: rentalData.paymentMethod === 'cash' ? 'pending' : 'pending',
      description: `Payment for machinery rental - Rental ID: ${rentalId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transaction);
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: Transaction['status'],
  transactionRef?: string
): Promise<void> => {
  try {
    const transactionDocRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    
    if (transactionRef) {
      updateData.transactionId = transactionRef;
    }
    
    await updateDoc(transactionDocRef, updateData);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
};

export const getTransactionsByRental = async (rentalId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('rentalId', '==', rentalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting transactions by rental:', error);
    throw new Error('Failed to get transactions');
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('payerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw new Error('Failed to get user transactions');
  }
};

export const getOwnerTransactions = async (ownerId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('payeeId', '==', ownerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const transactions: Transaction[] = [];
    
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as Transaction);
    });
    
    return transactions;
  } catch (error) {
    console.error('Error getting owner transactions:', error);
    throw new Error('Failed to get owner transactions');
  }
};

export const updatePaymentStatus = async (
  rentalId: string,
  paymentStatus: MachineryRental['paymentStatus'],
  transactionRef?: string
): Promise<void> => {
  try {
    const rentalRef = doc(db, RENTALS_COLLECTION, rentalId);
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    
    if (transactionRef) {
      updateData.transactionId = transactionRef;
    }
    
    await updateDoc(rentalRef, updateData);
    
    // Also update the transaction status
    const transactions = await getTransactionsByRental(rentalId);
    if (transactions.length > 0) {
      const transactionStatus = paymentStatus === 'paid' ? 'completed' : 
                              paymentStatus === 'failed' ? 'failed' : 'pending';
      await updateTransactionStatus(transactions[0].id, transactionStatus, transactionRef);
    }

    // Send payment notification
    try {
      const rental = await getRental(rentalId);
      if (rental) {
        const machinery = await getMachinery(rental.machineryId);
        if (machinery) {
          // Send notification to both renter and owner
          await notificationService.sendPaymentNotification(
            rental.renterId,
            machinery.name,
            rental.totalAmount,
            paymentStatus,
            rentalId
          );
          
          await notificationService.sendPaymentNotification(
            rental.ownerId,
            machinery.name,
            rental.totalAmount,
            paymentStatus,
            rentalId
          );
        }
      }
    } catch (notificationError) {
      console.error('Error sending payment notification:', notificationError);
      // Don't fail the payment update if notification fails
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error('Failed to update payment status');
  }
};
