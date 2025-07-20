import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { ArrowLeft, HelpCircle, Bell } from "lucide-react-native";

type AppHeaderProps = {
  title: string;
  showBackButton?: boolean;
  showHelpButton?: boolean;
  showNotificationButton?: boolean;
  showLocation?: boolean; // New prop for showing location
  location?: string; // New prop for location text
  onNotificationPress?: () => void;
  notificationCount?: number;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  showHelpButton = false,
  showNotificationButton = false,
  showLocation = false, // Default to false
  location, // Destructure location prop
  onNotificationPress,
  notificationCount = 0,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {showLocation && location && (
            <Text style={styles.locationText}>{location}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        {showNotificationButton && (
          <TouchableOpacity 
            style={styles.notificationButton} 
            onPress={onNotificationPress}
          >
            <Bell size={24} color={COLORS.white} />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        {showHelpButton && (
          <TouchableOpacity style={styles.helpButton}>
            <HelpCircle size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60, // Adjust as needed for status bar
    paddingBottom: 16,
    backgroundColor: COLORS.primary, // Green background
    borderBottomWidth: 0, // No border
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white, // White text
  },
  helpButton: {
    padding: 4,
    marginLeft: 8,
  },
  notificationButton: {
    padding: 4,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  locationText: {
    fontSize: 14,
    color: COLORS.white,
    marginTop: 4,
  },
});

export default AppHeader;
