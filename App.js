import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import TabNavigator from './src/navigation/TabNavigator';
import { AppProvider } from './src/context/AppContext';
import { enableLayoutAnimations } from './src/utils/animationUtils';

// Main starting point of the ReadySG app.
export default function App() {
  // Enable layout animations when the app starts.
  useEffect(() => {
    enableLayoutAnimations();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <TabNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}