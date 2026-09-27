import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

// Custom hook reporting whether the device is online. Putting it in a hook
// means any screen can use it in one line, and the polling logic only
// exists in one place.
export function useNetworkStatus() {
  // Assuming online at the start avoids flashing an offline banner for a
  // moment before the first check comes back.
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkConnection() {
      try {
        const state = await Network.getNetworkStateAsync();
        // Being connected to wifi is not the same as having working
        // internet, so both flags are checked.
        const connected = state.isConnected && state.isInternetReachable !== false;
        if (isMounted) setIsOnline(connected);
      } catch (error) {
        // If the check itself fails, assume online rather than blocking
        // features unnecessarily.
        if (isMounted) setIsOnline(true);
      }
    }

    checkConnection();
    // expo-network has no event listener, so this polls instead. Every ten
    // seconds is often enough to notice a change without draining battery.
    const interval = setInterval(checkConnection, 10000);

    return () => {
      // Without this cleanup the interval keeps running after the screen
      // closes and tries to update state that no longer exists.
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}