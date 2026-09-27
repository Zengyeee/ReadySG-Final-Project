import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Wraps expo-location so screens do not have to deal with permission
// states themselves. Every function returns a plain object describing what
// happened rather than throwing, because a denied permission is a normal
// thing for a user to choose - not an error condition.

export async function getCurrentCoordinates() {
  try {
    // Web browsers handle geolocation differently and often block it on
    // non-https origins, so this can legitimately fail during development.
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        coordinates: null,
        status: 'denied',
        message:
          'Location access was not granted. Showing all locations instead.',
      };
    }

    // Balanced accuracy is plenty for sorting a list of hospitals by
    // distance, and it returns much faster than high accuracy.
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      status: 'granted',
      message: null,
    };
  } catch (error) {
    return {
      coordinates: null,
      status: 'error',
      message:
        Platform.OS === 'web'
          ? 'Location is not available in this browser. Showing all locations.'
          : 'Could not get your location. Showing all locations instead.',
    };
  }
}