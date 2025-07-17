import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useLocation } from "@/context/LocationContext";
import { fetchWeatherData, fetchQuickTips } from "@/services/api";
import AppHeader from "@/components/common/AppHeader";
import DashboardGridButton from "@/components/common/DashboardGridButton";
import WeatherWidget from "@/components/home/WeatherWidget";
import QuickTipsBanner from "@/components/home/QuickTipsBanner";
import { COLORS } from "@/constants/colors";
import { Cloud, Leaf, BarChart2, ShoppingCart, Truck, Wrench, Users, User } from "lucide-react-native";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  soilMoisture: string;
  iconUrl: string;
}

interface Tip {
  id: string;
  title: string;
  description: string;
}

export default function HomeScreen() {
  const { user } = useUser();
  const { location } = useLocation();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const weatherData = await fetchWeatherData(location);
      const tipsData = await fetchQuickTips();
      
      setWeather(weatherData.data);
      setTips(tipsData.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [location]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title={location?.name || "Loading location..."} 
        showHelpButton={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name || "Farmer"}!
        </Text>
        
        {weather && <WeatherWidget weather={weather} />}
        
        {tips.length > 0 && <QuickTipsBanner tips={tips} />}
        
        <View style={styles.gridContainer}>
          <DashboardGridButton 
            icon={<Leaf size={32} color={COLORS.primary} />}
            label="Diagnose"
            onPress={() => router.push("/diagnose")}
          />
          <DashboardGridButton 
            icon={<BarChart2 size={32} color={COLORS.primary} />}
            label="Market Prices"
            onPress={() => router.push("/prices")}
          />
          <DashboardGridButton 
            icon={<ShoppingCart size={32} color={COLORS.primary} />}
            label="Fertilizer"
            onPress={() => router.push("/inputs/fertilizer")}
          />
          <DashboardGridButton 
            icon={<Truck size={32} color={COLORS.primary} />}
            label="Machinery"
            onPress={() => router.push("/inputs/machinery")}
          />
          <DashboardGridButton 
            icon={<Wrench size={32} color={COLORS.primary} />}
            label="Repair"
            onPress={() => router.push("/inputs/repair")}
          />
          <DashboardGridButton 
            icon={<Users size={32} color={COLORS.primary} />}
            label="Contacts"
            onPress={() => router.push("/contacts")}
          />
          <DashboardGridButton 
            icon={<Cloud size={32} color={COLORS.primary} />}
            label="Weather"
            onPress={() => router.push("/weather")}
          />
          <DashboardGridButton 
            icon={<User size={32} color={COLORS.primary} />}
            label="Profile"
            onPress={() => router.push("/profile")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    color: COLORS.textPrimary,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 24,
  },
});
