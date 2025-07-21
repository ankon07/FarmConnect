import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "@/hooks/useTranslation";
import AppHeader from "@/components/common/AppHeader";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { User, Settings, Bell, HelpCircle, LogOut, Languages } from "lucide-react-native";
import { logoutUser } from "@/services/authService"; // Import logoutUser

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLogout = async () => { // Made async
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => { // Made async
            try {
              await logoutUser(); // Call Firebase logout
              setUser(null); // Clear user in context
              router.replace("/login");
            } catch (error: any) {
              Alert.alert("Logout Error", error.message);
              console.error("Logout failed:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const profileOptions = [
    {
      id: "language",
      title: t("language-settings"),
      icon: <Languages size={24} color={COLORS.primary} />,
      onPress: () => router.push("/settings/language"),
    },
    {
      id: "account",
      title: "Account Settings",
      icon: <User size={24} color={COLORS.primary} />,
      onPress: () => router.push("/profile/edit"), // Navigate to edit profile screen
    },
    {
      id: "preferences",
      title: "App Preferences",
      icon: <Settings size={24} color={COLORS.primary} />,
      onPress: () => console.log("App preferences"),
    },
    {
      id: "help",
      title: "Help & Support",
      icon: <HelpCircle size={24} color={COLORS.primary} />,
      onPress: () => console.log("Help & support"),
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t("profile")} 
        showBackButton={true}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.imageUrl || "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.name || t("farmer")}</Text>
          <Text style={styles.profileLocation}>{user?.location || "Location not set"}</Text>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push("/profile/edit")} // Navigate to edit profile screen
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={notificationsEnabled ? COLORS.primary : COLORS.lightGray}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>SMS Alerts</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={locationEnabled ? COLORS.primary : COLORS.lightGray}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>Offline Mode</Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={offlineMode ? COLORS.primary : COLORS.lightGray}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionRow}
              onPress={option.onPress}
            >
              <View style={styles.optionInfo}>
                {option.icon}
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.logoutContainer}>
          <PrimaryButton
            title="Logout"
            onPress={handleLogout}
            variant="secondary"
            icon={<LogOut size={20} color={COLORS.error} />}
            style={styles.logoutButton}
            textStyle={styles.logoutText}
          />
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FarmConnect v1.0.0</Text>
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
  profileHeader: {
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editProfileText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  optionRow: {
    paddingVertical: 12,
  },
  optionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  logoutContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logoutButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
  },
  versionContainer: {
    padding: 16,
    alignItems: "center",
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
