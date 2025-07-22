import { Stack } from 'expo-router';
import React from 'react';

export default function SchedulingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add-crop" />
      <Stack.Screen name="add-task" />
      <Stack.Screen name="add-reminder" />
      <Stack.Screen name="crop-details" />
      <Stack.Screen name="task-details" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
