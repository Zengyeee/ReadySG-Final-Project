import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChecklistScreen from '../screens/ChecklistScreen';

const Stack = createNativeStackNavigator();

// Navigation stack used for the preparedness checklist.
export default function PrepareStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
    </Stack.Navigator>
  );
}