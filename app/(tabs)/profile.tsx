import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@/context/UserContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/context/LanguageContext";
import AppHeader from "@/components/common/AppHeader";
import PrimaryButton from "@/components/common/PrimaryButton";
import { COLORS } from "@/constants/colors";
import { User, Settings, Bell, HelpCircle, LogOut, Languages } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleLanguageToggle = (value: boolean) => {
    const newLanguage = value ? 'bn' : 'en';
    setLanguage(newLanguage);
  };

  const handleLogout = () => {
    Alert.alert(
      t("logout", "Logout"),
      t("logout-confirm", "Are you sure you want to logout?"),
      [
        {
          text: t("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("logout", "Logout"),
          onPress: () => {
            setUser(null);
            router.replace("/login");
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
      title: t("account-settings", "Account Settings"),
      icon: <User size={24} color={COLORS.primary} />,
      onPress: () => console.log("Account settings"),
    },
    {
      id: "preferences",
      title: t("app-preferences", "App Preferences"),
      icon: <Settings size={24} color={COLORS.primary} />,
      onPress: () => console.log("App preferences"),
    },
    {
      id: "help",
      title: t("help-support", "Help & Support"),
      icon: <HelpCircle size={24} color={COLORS.primary} />,
      onPress: () => console.log("Help & support"),
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader 
        title={t("profile")} 
        showBackButton={false}
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user?.imageUrl || "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.name || t("farmer")}</Text>
          <Text style={styles.profileLocation}>{user?.location || t("location-not-set", "Location not set")}</Text>
          
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>{t("edit-profile", "Edit Profile")}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("language")}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Languages size={20} color={COLORS.primary} />
              <View style={styles.languageInfo}>
                <Text style={styles.settingText}>
                  {currentLanguage === 'bn' ? t("bangla") : t("english")}
                </Text>
                <Text style={styles.languageSubtext}>
                  {currentLanguage === 'bn' ? 'English' : 'বাংলা'}
                </Text>
              </View>
            </View>
            <Switch
              value={currentLanguage === 'bn'}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
              thumbColor={currentLanguage === 'bn' ? COLORS.primary : COLORS.lightGray}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("notifications")}</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={COLORS.primary} />
              <Text style={styles.settingText}>{t("push-notifications", "Push Notifications")}</Text>
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
              <Text style={styles.settingText}>{t("sms-alerts", "SMS Alerts")}</Text>
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
              <Text style={styles.settingText}>{t("offline-mode", "Offline Mode")}</Text>
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
          <Text style={styles.sectionTitle}>{t("settings")}</Text>
          
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
            title={t("logout", "Logout")}
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
  languageInfo: {
    marginLeft: 12,
  },
  languageSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
