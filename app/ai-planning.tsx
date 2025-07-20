import React from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { Wheat, Fish, Users } from "lucide-react-native";

export default function AIPlanning() {
  const router = useRouter();

  const PlanningCard = ({ icon, title, onPress }: { icon: React.ReactNode; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.planningCard} onPress={onPress}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader 
        title="AI Planning" 
        showBackButton={true}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>AI-Powered Farming Plans</Text>
        <Text style={styles.subtitle}>
          Get personalized farming recommendations based on your specific conditions and requirements
        </Text>
        
        <View style={styles.gridContainer}>
          <PlanningCard 
            icon={<Wheat size={40} color={COLORS.primary} />}
            title="Crop Planning"
            onPress={() => router.push("/ai-planning/crop" as any)}
          />
          <PlanningCard 
            icon={<Users size={40} color={COLORS.primary} />}
            title="Livestock Planning"
            onPress={() => router.push("/ai-planning/livestock" as any)}
          />
          <PlanningCard 
            icon={<Fish size={40} color={COLORS.primary} />}
            title="Fish Planning"
            onPress={() => router.push("/ai-planning/fish" as any)}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. Select your farming type (Crop, Livestock, or Fish)
          </Text>
          <Text style={styles.infoText}>
            2. Fill out the detailed planning form
          </Text>
          <Text style={styles.infoText}>
            3. Get AI-generated recommendations
          </Text>
          <Text style={styles.infoText}>
            4. Download your plan or share with government officers
          </Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  gridContainer: {
    flexDirection: "column",
    marginBottom: 32,
  },
  planningCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.lightBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
