import { Tabs } from "expo-router";
import React from "react";
import { Home, Leaf, ShoppingCart, Users, BarChart2 } from "lucide-react-native";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="diagnose"
        options={{
          title: "Diagnose",
          tabBarIcon: ({ color }) => <Leaf size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: "Prices",
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inputs"
        options={{
          title: "Inputs",
          tabBarIcon: ({ color }) => <ShoppingCart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}