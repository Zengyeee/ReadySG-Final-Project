import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, touchTarget } from '../theme/theme';

// Reusable card used to show different sections on the home dashboard.
export default function SectionCard({
  icon,
  title,
  subtitle,
  value,
  onPress,
  children,
}) {
  // Makes the card clickable only when an onPress function is provided.
  const Wrapper = onPress ? Pressable : View;

  // Combines the important information into one label for screen readers.
  const label = [title, subtitle, value ? `${value} points` : null]
    .filter(Boolean)
    .join('. ');

  return (
    <Wrapper
      style={styles.card}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? label : undefined}
      accessibilityHint={onPress ? 'Opens more detail' : undefined}
    >
      <View style={styles.header}>
        {icon ? (
          <View style={styles.iconCircle}>
            {/* Icon is hidden from screen readers because the text already explains it. */}
            <Ionicons
              name={icon}
              size={18}
              color={colors.primary}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          </View>
        ) : null}

        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}
        </View>

        {value ? <Text style={styles.value}>{value}</Text> : null}

        {/* Show an arrow when the card can be pressed. */}
        {onPress ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textMuted}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        ) : null}
      </View>

      {children}
    </Wrapper>
  );
}

// Styling shared by all section cards.
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    minHeight: touchTarget,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { ...typography.bodyStrong, marginBottom: 2 },
  value: { fontSize: 18, fontWeight: '800', color: colors.primary },
});