import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

// Custom hook used to check whether the device has an internet connection.
export function useNetworkStatus() {
  // Start as online while waiting for the first network check.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkConnection() {
      try {
        const state = await Network.getNetworkStateAsync();

        // Check both the network connection and internet availability.
        const connected = state.isConnected && state.isInternetReachable !== false;
        if (isMounted) setIsOnline(connected);
      } catch (error) {
        // Assume online if the network check fails.
        if (isMounted) setIsOnline(true);
      }
    }

    checkConnection();

    // Check the connection again every 10 seconds.
    const interval = setInterval(checkConnection, 10000);

    return () => {
      // Stop checking when the hook is no longer being used.
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}