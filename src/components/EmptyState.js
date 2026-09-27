import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme/theme';

// Shown whenever a list has nothing in it. Every list screen needs one of
// these - a blank white screen looks broken rather than empty.
export default function EmptyState({ icon = 'file-tray-outline', title, message }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={44} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  title: { ...typography.heading, marginTop: spacing.lg, textAlign: 'center' },
  message: { ...typography.caption, marginTop: spacing.sm, textAlign: 'center' },
});