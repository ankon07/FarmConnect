import React, { createContext, useState, useContext, useEffect } from "react";
import * as Location from "expo-location";
import { Platform, Alert } from "react-native";

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
  hasLocationPermission: boolean;
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationData | null>;
  userLocation: Location.LocationObject | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  // Check location permission status
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to show nearby machinery and provide accurate distance calculations. Please enable location access in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setError('Location permission denied');
      } else {
        setError(null);
        // Get current location after permission is granted
        getCurrentLocation();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setError('Failed to request location permission');
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation(currentLocation);

      // Reverse geocode to get location name
      let locationName = "Current Location";
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (reverseGeocode.length > 0) {
          const address = reverseGeocode[0];
          locationName = `${address.city || address.district || address.subregion}, ${address.country}`;
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError);
      }

      const locationData: LocationData = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        name: locationName,
      };

      setLocation(locationData);
      setIsLoading(false);
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Failed to get current location');
      setIsLoading(false);
      
      // Fallback to default location
      const defaultLocation: LocationData = {
        latitude: 23.8103,
        longitude: 90.4125,
        name: "Dhaka, Bangladesh (Default)",
      };
      setLocation(defaultLocation);
      return defaultLocation;
    }
  };

  useEffect(() => {
    // Initialize location on app start
    const initializeLocation = async () => {
      setIsLoading(true);
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          // If permission is still not granted after request, set default
          setLocation({
            latitude: 23.8103,
            longitude: 90.4125,
            name: "Dhaka, Bangladesh (Default)",
          });
          setIsLoading(false);
          return;
        }
      }
      // If permission is granted (or was already granted), get current location
      await getCurrentLocation();
    };

    initializeLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ 
      location, 
      setLocation, 
      isLoading, 
      error, 
      hasLocationPermission,
      requestLocationPermission,
      getCurrentLocation,
      userLocation
    }}>
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
