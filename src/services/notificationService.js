import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Handles local notifications when the flood or haze risk increases.

// Show notifications even when the app is currently open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Ask the user for permission to send notifications.
export async function requestNotificationPermission() {
  // Skip notifications when the app is running on web.
  if (Platform.OS === 'web') {
    return { granted: false, reason: 'web' };
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();

    // Do not ask again if permission was already given.
    if (existing === 'granted') return { granted: true, reason: null };

    const { status } = await Notifications.requestPermissionsAsync();
    return { granted: status === 'granted', reason: status };
  } catch (error) {
    return { granted: false, reason: 'error' };
  }
}

// Send a local notification immediately.
export async function sendRiskNotification(title, body) {
  if (Platform.OS === 'web') return false;

  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
    return true;
  } catch (error) {
    console.warn('Could not send notification:', error);
    return false;
  }
}