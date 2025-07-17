import { Stack } from "expo-router";
import React from "react";
import { COLORS } from "@/constants/colors";

export default function InputsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="fertilizer"
        options={{ title: "Fertilizer Stock" }}
      />
      <Stack.Screen
        name="machinery"
        options={{ title: "Machinery Rental" }}
      />
      <Stack.Screen
        name="repair"
        options={{ title: "Repair & Servicing" }}
      />
    </Stack>
  );
}