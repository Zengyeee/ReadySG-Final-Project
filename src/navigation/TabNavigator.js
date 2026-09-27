import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeStack from './HomeStack';
import PrepareStack from './PrepareStack';
import LearnScreen from '../screens/LearnScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

// Mapping each route to its icon here keeps the screenOptions function
// tidy instead of a long if/else chain.
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
        headerShown: false, // each screen draws its own header
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
          // Outline when inactive, filled when active. Small touch, but it
          // makes the selected tab much clearer.
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
      {/* Home and Prepare point at stacks so their detail screens can open
          on top while keeping the tab bar visible. */}
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Prepare" component={PrepareStack} />
      <Tab.Screen name="Learn" component={LearnScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
    </Tab.Navigator>
  );
}