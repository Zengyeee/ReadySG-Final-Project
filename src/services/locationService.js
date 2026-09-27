import * as Location from 'expo-location';
import { Platform } from 'react-native';

// Handles location permission and gets the user's current location.
export async function getCurrentCoordinates() {
  try {
    // Ask the user for permission to use their location.
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        coordinates: null,
        status: 'denied',
        message:
          'Location access was not granted. Showing all locations instead.',
      };
    }

    // Balanced accuracy is enough for sorting nearby support locations.
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
    // Show all locations if the user's location cannot be found.
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