import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { COLORS } from "@/constants/colors";

type TabViewProps = {
  tabs: string[];
  activeTab: string;
  onChangeTab: (tab: string) => void;
};

const TabView: React.FC<TabViewProps> = ({ tabs, activeTab, onChangeTab }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => onChangeTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
});

export default TabView;