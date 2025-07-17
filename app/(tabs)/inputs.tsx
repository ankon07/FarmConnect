import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "@/components/common/AppHeader";
import { COLORS } from "@/constants/colors";
import { ShoppingCart, Truck, Wrench } from "lucide-react-native";

export default function InputsScreen() {
  const router = useRouter();

  const inputOptions = [
    {
      id: "fertilizer",
      title: "Fertilizer Stock",
      description: "Check availability of fertilizers in nearby government stores",
      icon: <ShoppingCart size={32} color={COLORS.primary} />,
      route: "/inputs/fertilizer",
    },
    {
      id: "machinery",
      title: "Machinery Rental",
      description: "Rent agricultural equipment and machinery",
      icon: <Truck size={32} color={COLORS.primary} />,
      route: "/inputs/machinery",
    },
    {
      id: "repair",
      title: "Repair & Servicing",
      description: "Book repair services for your farming equipment",
      icon: <Wrench size={32} color={COLORS.primary} />,
      route: "/inputs/repair",
    },
  ];

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Inputs & Resources" 
        showBackButton={false}
      />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Select a Service</Text>
        
        <View style={styles.optionsContainer}>
          {inputOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => router.push(option.route)}
            >
              <View style={styles.iconContainer}>{option.icon}</View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  optionsContainer: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
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
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: COLORS.textPrimary,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});