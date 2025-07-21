import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import { getUserProfile, createUserProfile } from "../services/userService"; // Import userService functions

export type User = {
  id: string;
  name: string;
  username: string; // Keeping username for compatibility, will map to email
  email: string; // Added email property
  imageUrl?: string;
  location?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Set to true initially for auth loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let appUser: User | null = null;
        try {
          // Try to fetch user profile from Firestore
          const userProfile = await getUserProfile(firebaseUser.uid);

          if (userProfile) {
            // If profile exists, use it
            appUser = userProfile;
          } else {
            // If no profile exists, create a basic one from Firebase auth data
            const initialProfileData: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email || "",
              username: firebaseUser.email || "",
              email: firebaseUser.email || "",
              imageUrl: firebaseUser.photoURL || undefined,
              location: undefined,
            };
            await createUserProfile(firebaseUser.uid, initialProfileData);
            appUser = initialProfileData;
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
          // Fallback to basic Firebase user data if Firestore fails
          appUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || "",
            username: firebaseUser.email || "",
            email: firebaseUser.email || "",
            imageUrl: firebaseUser.photoURL || undefined,
            location: undefined,
          };
        }
        await handleSetUser(appUser);
      } else {
        await handleSetUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSetUser = async (newUser: User | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        await AsyncStorage.setItem("user", JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Failed to save user to storage:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
