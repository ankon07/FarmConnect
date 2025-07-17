import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { COLORS } from "@/constants/colors";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react-native";

type Tip = {
  id: string;
  title: string;
  description: string;
};

type QuickTipsBannerProps = {
  tips: Tip[];
};

const QuickTipsBanner: React.FC<QuickTipsBannerProps> = ({ tips }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  const nextTip = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const prevTip = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    setCurrentIndex((prevIndex) => (prevIndex - 1 + tips.length) % tips.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextTip();
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  if (!tips.length) return null;

  const currentTip = tips[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <AlertTriangle size={16} color={COLORS.primary} />
          <Text style={styles.title}>Quick Tip</Text>
        </View>
        
        <View style={styles.navigation}>
          <TouchableOpacity onPress={prevTip} style={styles.navButton}>
            <ChevronLeft size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <Text style={styles.pageIndicator}>
            {currentIndex + 1}/{tips.length}
          </Text>
          
          <TouchableOpacity onPress={nextTip} style={styles.navButton}>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.tipTitle}>{currentTip.title}</Text>
        <Text style={styles.tipDescription}>{currentTip.description}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    padding: 4,
  },
  pageIndicator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default QuickTipsBanner;