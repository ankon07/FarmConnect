import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/colors";
import { ArrowLeft, HelpCircle } from "lucide-react-native";

type AppHeaderProps = {
  title: string;
  showBackButton?: boolean;
  showHelpButton?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  showHelpButton = false,
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
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {showHelpButton && (
        <TouchableOpacity style={styles.helpButton}>
          <HelpCircle size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}
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
  },
});

export default AppHeader;
