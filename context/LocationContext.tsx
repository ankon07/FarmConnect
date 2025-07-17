import React, { createContext, useState, useContext, useEffect } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

export type LocationData = {
  latitude: number;
  longitude: number;
  name: string;
};

type LocationContextType = {
  location: LocationData | null;
  setLocation: (location: LocationData | null) => void;
  isLoading: boolean;
  error: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default location immediately for Expo Go compatibility
    setLocation({
      latitude: 23.8103,
      longitude: 90.4125,
      name: "Dhaka, Bangladesh",
    });
    setIsLoading(false);
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation, isLoading, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
