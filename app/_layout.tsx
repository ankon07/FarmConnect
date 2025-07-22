import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "@/context/UserContext";
import { LocationProvider } from "@/context/LocationContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { SchedulingProvider } from "@/context/SchedulingContext";
import { notificationService } from "@/services/notificationService";
import { dailySchedulerService } from "@/services/dailySchedulerService";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="weather" options={{ headerShown: false }} />
      <Stack.Screen name="bamis-weather" options={{ headerShown: false }} />
      <Stack.Screen name="scheduling" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();
        
        // Initialize daily scheduler service
        await dailySchedulerService.initialize();
        
        console.log('All services initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initializeServices();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <UserProvider>
          <LocationProvider>
            <SchedulingProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </SchedulingProvider>
          </LocationProvider>
        </UserProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
