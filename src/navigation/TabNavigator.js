import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeStack from './HomeStack';
import PrepareStack from './PrepareStack';
import LearnScreen from '../screens/LearnScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

// Icons used for each tab in the bottom navigation.
const ICONS = {
  Home: 'home',
  Prepare: 'checkbox',
  Learn: 'school',
  Resources: 'call',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Each screen uses its own header.
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => {
          const name = ICONS[route.name];

          // Use a filled icon for the selected tab.
          return (
            <Ionicons
              name={focused ? name : `${name}-outline`}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      {/* Main tabs shown at the bottom of the app. */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Prepare" component={PrepareStack} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
    </Tab.Navigator>
  );
}