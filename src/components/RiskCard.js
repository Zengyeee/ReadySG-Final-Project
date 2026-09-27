import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, riskPalette, touchTarget } from '../theme/theme';

// The main risk display on the dashboard.
//
// Two accessibility decisions here. The risk level is always shown as text
// as well as colour, because colour alone would be unreadable for a
// colour-blind user and this is an app where misreading the level matters.
// And an unknown risk gets a question-mark icon rather than a colour
// swatch, so it never reads as a real level at a glance.
export default function RiskCard({ title, icon, risk, detail, onPress }) {
  const palette = riskPalette(risk);
  const isUnavailable = risk === 'Unavailable';

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