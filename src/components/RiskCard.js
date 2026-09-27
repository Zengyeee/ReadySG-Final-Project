import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, riskPalette, touchTarget } from '../theme/theme';

// Displays the current flood or haze risk on the dashboard.
export default function RiskCard({ title, icon, risk, detail, onPress }) {
  const palette = riskPalette(risk);
  const isUnavailable = risk === 'Unavailable';

  // Show the risk as text as well as colour for better accessibility.
  const spokenRisk = isUnavailable ? 'Risk unknown' : `${risk} risk`;

  return (
    <Pressable
      style={[
        styles.card,
        { backgroundColor: palette.bg, borderColor: palette.border },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${spokenRisk}. ${detail}`}
      accessibilityHint="Opens guidance for this risk level"
    >
      <View style={styles.header}>
        <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
          {icon}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </View>

      <View style={styles.levelRow}>
        {/* Show a question mark when the risk data is not available. */}
        {isUnavailable && (
          <Ionicons
            name="help-circle-outline"
            size={20}
            color={palette.text}
            style={styles.levelIcon}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}
        <Text style={[styles.level, { color: palette.text }]}>{spokenRisk}</Text>
      </View>

      <Text style={styles.detail}>{detail}</Text>
    </Pressable>
  );
}

// Styling for the risk card and its information.
const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: touchTarget,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 20 },
  title: { ...typography.heading, flex: 1 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  levelIcon: { marginRight: spacing.xs },
  level: { fontSize: 20, fontWeight: '800' },
  detail: { ...typography.caption },
});