import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { COLORS } from '@/constants/colors';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import WeatherWidget from './WeatherWidget';
import { BamisWeatherWidget } from '../weather/BamisWeatherWidget';
import TasksWidget from './TasksWidget';
import QuickActionsWidget from './QuickActionsWidget';

const { width: screenWidth } = Dimensions.get('window');

interface SlideableWidgetContainerProps {
  userRegion?: string;
}

const SlideableWidgetContainer: React.FC<SlideableWidgetContainerProps> = ({ userRegion }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureState = useRef(new Animated.Value(0)).current;
  
  // Widget configurations
  const widgets = [
    {
      id: 'weather',
      title: t("weather"),
      component: <WeatherWidget />,
      icon: '🌤️',
    },
    {
      id: 'bamis-weather',
      title: t("bamis-weather"),
      component: <BamisWeatherWidget userRegion={userRegion} />,
      icon: '🌦️',
    },
    {
      id: 'tasks',
      title: t("todays-tasks"),
      component: <TasksWidget />,
      icon: '📋',
    },
    {
      id: 'quick-actions',
      title: t("quick-actions"),
      component: <QuickActionsWidget />,
      icon: '⚡',
    },
  ];

  const totalWidgets = widgets.length;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: gestureState } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX, velocityX } = event.nativeEvent;
      const threshold = screenWidth * 0.25;
      
      let newIndex = currentIndex;
      
      if (translationX > threshold || velocityX > 800) {
        // Swipe right - go to previous widget
        newIndex = Math.max(0, currentIndex - 1);
      } else if (translationX < -threshold || velocityX < -800) {
        // Swipe left - go to next widget
        newIndex = Math.min(totalWidgets - 1, currentIndex + 1);
      }
      
      goToWidget(newIndex);
      
      // Reset gesture state
      Animated.spring(gestureState, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
  };

  const goToWidget = (index: number) => {
    setCurrentIndex(index);
    Animated.spring(translateX, {
      toValue: -index * (screenWidth - 32), // Account for padding
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      goToWidget(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalWidgets - 1) {
      goToWidget(currentIndex + 1);
    }
  };

  useEffect(() => {
    // Combine gesture and scroll animations
    const animatedTranslateX = Animated.add(
      translateX,
      gestureState
    );
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.widgetContainer}>
        {/* Header with navigation */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={20} color={currentIndex === 0 ? COLORS.textSecondary : COLORS.primary} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.widgetTitle}>
              {widgets[currentIndex].icon} {widgets[currentIndex].title}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.navButton, currentIndex === totalWidgets - 1 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={currentIndex === totalWidgets - 1}
          >
            <ChevronRight size={20} color={currentIndex === totalWidgets - 1 ? COLORS.textSecondary : COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Slideable content */}
        <View style={styles.slideWrapper}>
          <GestureHandlerRootView style={styles.gestureContainer}>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              activeOffsetX={[-10, 10]}
              failOffsetY={[-5, 5]}
            >
              <Animated.View
                style={[
                  styles.slideContainer,
                  {
                    transform: [
                      {
                        translateX: Animated.add(translateX, gestureState),
                      },
                    ],
                  },
                ]}
              >
                {widgets.map((widget, index) => (
                  <View key={widget.id} style={styles.widgetSlide}>
                    <ScrollView 
                      style={styles.widgetContent}
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {widget.component}
                    </ScrollView>
                  </View>
                ))}
              </Animated.View>
            </PanGestureHandler>
          </GestureHandlerRootView>
        </View>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {widgets.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
              onPress={() => goToWidget(index)}
            />
          ))}
        </View>

        {/* Swipe hint */}
        <View style={styles.swipeHint}>
          <Text style={styles.swipeHintText}>
            ← {t("swipe-to-explore")} →
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  widgetContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  slideWrapper: {
    height: 120,
    overflow: 'hidden',
  },
  gestureContainer: {
    flex: 1,
  },
  slideContainer: {
    flexDirection: 'row',
    width: (screenWidth - 32) * 4, // 4 widgets, accounting for container margins
    height: '100%',
  },
  widgetSlide: {
    width: screenWidth - 32,
    height: '100%',
  },
  widgetContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  paginationDotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  swipeHint: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    alignItems: 'center',
  },
  swipeHintText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default SlideableWidgetContainer;
