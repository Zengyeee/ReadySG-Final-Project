import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, touchTarget } from '../theme/theme';

// A tappable card used for the sections on the home dashboard. Pulled out
// as a component because the same shape appears four or five times and
// duplicating it would make changing the style a chore.
export default function SectionCard({
  icon,
  title,
  subtitle,
  value,
  onPress,
  children,
}) {
  const Wrapper = onPress ? Pressable : View;

  // Screen readers announce the whole card as one thing rather than
  // reading out disconnected fragments of title, subtitle and number.
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
            {/* The icon repeats information already in the text, so it is
                hidden from screen readers rather than announced twice. */}
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