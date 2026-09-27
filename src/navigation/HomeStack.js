import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import GuidanceScreen from '../screens/GuidanceScreen';
import NearbySupportScreen from '../screens/NearbySupportScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Navigation stack used for the Home section of the app.
export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={HomeScreen} />

      {/* These screens open on top of the main dashboard. */}
      <Stack.Screen
        name="Guidance"
        component={GuidanceScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="NearbySupport"
        component={NearbySupportScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}