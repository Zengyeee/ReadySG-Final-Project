import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChecklistScreen from '../screens/ChecklistScreen';

const Stack = createNativeStackNavigator();

// Only one screen for now. It is a stack rather than a plain screen so
// achievements and any future detail screens can be pushed on top later
// without restructuring the navigator.
export default function PrepareStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Checklist" component={ChecklistScreen} />
    </Stack.Navigator>
  );
}