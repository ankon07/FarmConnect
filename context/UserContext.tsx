import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: string;
  name: string;
  username: string;
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // For Expo Go compatibility, start with no user and no loading
    setIsLoading(false);
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
