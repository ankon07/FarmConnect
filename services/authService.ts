import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithCredential,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  ConfirmationResult,
  ApplicationVerifier
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, twitterProvider, firebaseConfig } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession(); // Required for Expo AuthSession

export const registerUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async () => {
  // For now, we'll show a helpful message to users
  // In a production app, you would need to set up proper OAuth flow
  throw new Error('Google sign-in is currently being configured. Please use email/password authentication for now.');
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Facebook Sign-In
export const signInWithFacebook = async () => {
  // For now, we'll show a helpful message to users
  // In a production app, you would need to configure Facebook App ID
  throw new Error('Facebook sign-in is currently being configured. Please use email/password authentication for now.');
};

// Phone Authentication
let confirmationResult: ConfirmationResult | null = null;

export const sendPhoneVerification = async (phoneNumber: string, recaptchaVerifier: ApplicationVerifier) => {
  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error: any) {
    throw new Error(`Phone verification error: ${error.message}`);
  }
};

export const verifyPhoneCode = async (code: string) => {
  try {
    if (!confirmationResult) {
      throw new Error('No phone verification in progress');
    }
    const userCredential = await confirmationResult.confirm(code);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(`Phone code verification error: ${error.message}`);
  }
};

// Link phone number to existing account
export const linkPhoneNumber = async (phoneNumber: string, recaptchaVerifier: ApplicationVerifier) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const phoneCredential = PhoneAuthProvider.credential(phoneNumber, '');
    // This would typically be used with a verification code
    // For now, we'll use the phone verification flow
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmation;
  } catch (error: any) {
    throw new Error(`Phone linking error: ${error.message}`);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};
