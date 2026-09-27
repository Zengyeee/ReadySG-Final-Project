import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import TabNavigator from './src/navigation/TabNavigator';
import { AppProvider } from './src/context/AppContext';
import { enableLayoutAnimations } from './src/utils/animationUtils';

// App.js stays small on purpose - it only sets up the providers that
// everything else depends on. All the actual screens live under src/.
export default function App() {
  // Android needs layout animations switched on explicitly, and it only
  // has to happen once when the app starts.
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