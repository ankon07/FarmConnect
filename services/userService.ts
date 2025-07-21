import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from '@/context/UserContext'; // Import the User type

export const createUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true }); // Use merge to avoid overwriting existing fields
  } catch (error: any) {
    throw new Error(`Error creating user profile: ${error.message}`);
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as User;
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(`Error getting user profile: ${error.message}`);
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(`Error updating user profile: ${error.message}`);
  }
};
