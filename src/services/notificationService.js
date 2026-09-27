import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Local notifications only. The app cannot monitor conditions while it is
// closed - that would need a server pushing alerts, which is outside the
// scope of this project. What this does is notify the user when a refresh
// finds that conditions have worsened since the last time they looked.
//
// Being clear about that matters. An emergency app that implies it is
// watching in the background when it is not would be genuinely dangerous.
//
// This file contains only the parts that touch the notifications API. The
// decision of whether to notify, and the message wording, live in
// notificationUtils so they can be unit tested without loading this
// package.

// Shows the notification even when the app is in the foreground, so the
// user sees it at the moment the risk changes rather than only later.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  // Notifications are not supported in a browser the way they are on a
  // device, so this is skipped rather than failing noisily on web.
  if (Platform.OS === 'web') {
    return { granted: false, reason: 'web' };
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();

    // Only ask if we have not already been given an answer. Repeatedly
    // prompting someone who said no is poor practice.
    if (existing === 'granted') return { granted: true, reason: null };

    const { status } = await Notifications.requestPermissionsAsync();
    return { granted: status === 'granted', reason: status };
  } catch (error) {
    return { granted: false, reason: 'error' };
  }
}

// Fires immediately rather than being scheduled, because it is reporting
// something that has just been discovered.
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