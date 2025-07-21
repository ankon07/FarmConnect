import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD322tQP7sMNz-k_5a0rJ9n15wf2LuiaBE",
  authDomain: "farmconnect-9bbbe.firebaseapp.com",
  projectId: "farmconnect-9bbbe",
  storageBucket: "farmconnect-9bbbe.firebasestorage.app",
  messagingSenderId: "95923175999",
  appId: "1:95923175999:android:502d82be4d8817fad92e8a",
  // Add your Web client ID for Google Sign-In (from Firebase project settings -> Authentication -> Sign-in method -> Google)
  webClientId: "723768660656-rtauueil69nsdbglhpt2rujtdn90fnae.apps.googleusercontent.com",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// OAuth Providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure Facebook provider
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export { auth, db, firebaseConfig };
