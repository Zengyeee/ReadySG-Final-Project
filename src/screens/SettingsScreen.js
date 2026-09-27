import React from 'react';
import { View, Text, Pressable, Switch, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing, typography } from '../theme/theme';

// Shows a confirmation message before resetting the user's data.
function confirmAction({ title, message, onConfirm }) {
  // Use the browser confirmation when running the app on web.
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }

  // Use the normal React Native alert on mobile.
  // eslint-disable-next-line global-require
  const { Alert } = require('react-native');
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Reset', style: 'destructive', onPress: onConfirm },
  ]);
}

// Allows the user to change app settings and reset saved data.
export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, resetAllData } = useApp();

  function handleReset() {
    confirmAction({
      title: 'Reset all data',
      message:
        'This clears your checklist, quiz answers, points and badges. It cannot be undone.',
      onConfirm: resetAllData,
    });
  }

  return (
    <ScreenContainer
      title="Settings"
      headerRight={
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      }
    >
      <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Risk alerts</Text>
            <Text style={typography.caption}>
              Notify me when flood or haze risk rises
            </Text>
          </View>
          <Switch
            value={settings.riskNotificationsEnabled}
            onValueChange={(value) =>
              updateSettings({ riskNotificationsEnabled: value })
            }
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityLabel="Risk alert notifications"
          />
        </View>
      </View>

      {/* Explain how the risk notifications work. */}
      <View style={styles.noteCard}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.noteText}>
          ReadySG checks conditions when you open or refresh the app. It does
          not monitor in the background, so always check official sources
          during an emergency.
        </Text>
      </View>

      <Text style={styles.sectionLabel}>FEEDBACK</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Haptic feedback</Text>
            <Text style={typography.caption}>
              Vibrate when completing tasks and answering questions
            </Text>
          </View>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityLabel="Haptic feedback"
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>DATA</Text>

      {/* Reset all progress and settings stored on the device. */}
      <Pressable
        style={styles.resetButton}
        onPress={handleReset}
        accessibilityRole="button"
        accessibilityLabel="Reset all app data"
      >
        <Text style={styles.resetText}>Reset all data</Text>
      </Pressable>
      <Text style={styles.resetHint}>
        Clears everything stored on this device and starts fresh.
      </Text>

      <Text style={styles.sectionLabel}>ABOUT</Text>

      <View style={styles.card}>
        <Text style={styles.aboutText}>
          ReadySG helps you prepare for flood and haze in Singapore. Risk
          information comes from public data.gov.sg feeds published by NEA and
          PUB.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScreenContainer>
  );
}

// Styling for the settings screen.
const styles = StyleSheet.create({
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  rowText: { flex: 1 },
  rowTitle: { ...typography.bodyStrong, marginBottom: 2 },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  noteText: { ...typography.caption, flex: 1, lineHeight: 19 },
  resetButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  resetText: { color: colors.danger, fontWeight: '700' },
  resetHint: { ...typography.caption, marginTop: spacing.sm, textAlign: 'center' },
  aboutText: { ...typography.body, lineHeight: 21 },
  versionText: { ...typography.caption, marginTop: spacing.md },
});