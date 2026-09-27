import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';
import { describeAge } from '../utils/dateUtils';

// Tells the user where the information on screen came from.
//
// Showing cached data without saying so would be dishonest in an app
// people might rely on during an emergency, so a cached reading always
// carries its age.
export default function StatusBanner({ dataStatus, cacheAge, isOnline }) {
  // Live data needs no explanation - a banner on every successful load
  // would just be noise.
  if (dataStatus === 'live' && isOnline) return null;

  let icon = 'information-circle-outline';
  let message = '';
  let tone = styles.neutral;
  let textTone = styles.neutralText;

  if (!isOnline) {
    icon = 'cloud-offline-outline';
    message =
      dataStatus === 'cached'
        ? `You are offline. Showing information saved ${describeAge(cacheAge)}.`
        : 'You are offline. Preparedness guidance below still works.';
    tone = styles.warning;
    textTone = styles.warningText;
  } else if (dataStatus === 'cached') {
    icon = 'time-outline';
    message = `Live update failed. Showing information saved ${describeAge(cacheAge)}.`;
    tone = styles.warning;
    textTone = styles.warningText;
  } else if (dataStatus === 'unavailable') {
    icon = 'alert-circle-outline';
    message =
      'Live risk information is unavailable. Check official sources in the Resources tab.';
    tone = styles.danger;
    textTone = styles.dangerText;
  } else if (dataStatus === 'loading') {
    icon = 'sync-outline';
    message = 'Checking latest conditions...';
  }

  if (!message) return null;

  return (
    <View
      style={[styles.banner, tone]}
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <Ionicons
        name={icon}
        size={18}
        color={textTone.color}
      />
      <Text style={[styles.text, textTone]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  text: { flex: 1, fontSize: 13, fontWeight: '500' },
  neutral: { backgroundColor: colors.surfaceAlt },
  neutralText: { color: colors.textSecondary },
  warning: { backgroundColor: colors.riskModerate.bg },
  warningText: { color: colors.riskModerate.text },
  danger: { backgroundColor: colors.riskHigh.bg },
  dangerText: { color: colors.riskHigh.text },
});