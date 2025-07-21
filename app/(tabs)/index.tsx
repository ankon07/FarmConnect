import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useLocation } from "@/context/LocationContext";
import { useTranslation } from "@/hooks/useTranslation";
import { fetchWeatherData, fetchQuickTips } from "@/services/api";
import { getNotificationCount } from "@/services/bamisApi";
import AppHeader from "@/components/common/AppHeader";
import DashboardGridButton from "@/components/common/DashboardGridButton";
import WeatherWidget from "@/components/home/WeatherWidget";
import QuickTipsBanner from "@/components/home/QuickTipsBanner";
import { COLORS } from "@/constants/colors";
import { Cloud, Leaf, BarChart2, ShoppingCart, Truck, Wrench, Users, User, Building2, Brain, Store } from "lucide-react-native";

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
  const { t } = useTranslation();
  const router = useRouter();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [tips, setTips] = useState<Tip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const loadData = async () => {
    try {
      const weatherData = await fetchWeatherData(location);
      const tipsData = await fetchQuickTips();
      const notifCount = await getNotificationCount();
      
      setWeather(weatherData.data);
      setTips(tipsData.data);
      setNotificationCount(notifCount);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    router.push("/notifications" as any);
  };

  useEffect(() => {
    loadData();
  }, [location]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("good-morning");
    if (hour < 18) return t("good-afternoon");
    return t("good-evening");
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title={location?.name || t("loading-location")} 
        showHelpButton={true}
        showNotificationButton={true}
        notificationCount={notificationCount}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.greeting}>
          {getGreeting()}, {user?.name || t("farmer")}!
        </Text>
        
        <WeatherWidget />
        
        {tips.length > 0 && <QuickTipsBanner tips={tips} />}
        
        <View style={styles.gridContainer}>
          <DashboardGridButton 
            icon={<Leaf size={32} color={COLORS.primary} />}
            label={t("diagnose")}
            onPress={() => router.navigate("/(tabs)/diagnose" as any)}
          />
          <DashboardGridButton 
            icon={<BarChart2 size={32} color={COLORS.primary} />}
            label={t("market-prices")}
            onPress={() => router.push("/prices" as any)}
          />
          <DashboardGridButton 
            icon={<ShoppingCart size={32} color={COLORS.primary} />}
            label={t("fertilizer")}
            onPress={() => router.push("/inputs/fertilizer")}
          />
          <DashboardGridButton 
            icon={<Truck size={32} color={COLORS.primary} />}
            label={t("machinery")}
            onPress={() => router.push("/inputs/machinery")}
          />
          <DashboardGridButton 
            icon={<Wrench size={32} color={COLORS.primary} />}
            label={t("repair")}
            onPress={() => router.push("/inputs/repair")}
          />
          <DashboardGridButton 
            icon={<Users size={32} color={COLORS.primary} />}
            label={t("contacts")}
            onPress={() => router.navigate("/(tabs)/contacts" as any)}
          />
          <DashboardGridButton 
            icon={<Cloud size={32} color={COLORS.primary} />}
            label={t("weather")}
            onPress={() => router.push("/weather")}
          />
          <DashboardGridButton 
            icon={<User size={32} color={COLORS.primary} />}
            label={t("profile")}
            onPress={() => router.navigate("/(tabs)/profile" as any)}
          />
          <DashboardGridButton 
            icon={<Building2 size={32} color={COLORS.primary} />}
            label={t("govt-services")}
            onPress={() => router.push("/govt-services" as any)}
          />
          <DashboardGridButton 
            icon={<Leaf size={32} color={COLORS.success} />}
            label={t("badc-services")}
            onPress={() => router.push("/badc" as any)}
          />
          <DashboardGridButton 
            icon={<Brain size={32} color={COLORS.primary} />}
            label={t("ai-planning")}
            onPress={() => router.push("/ai-planning")}
          />
          <DashboardGridButton 
            icon={<BarChart2 size={32} color={COLORS.secondary} />}
            label={t("smart-scheduling")}
            onPress={() => router.push("/scheduling")}
          />
          <DashboardGridButton 
            icon={<Store size={32} color={COLORS.primary} />}
            label={t("merchandise")}
            onPress={() => router.push("/merchandise")}
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
