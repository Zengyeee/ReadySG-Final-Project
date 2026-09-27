import React, { useState } from 'react';
import { View, Text, Pressable, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import { useApp } from '../context/AppContext';
import { guidance, unavailableGuidance } from '../data/guidance';
import { guidanceLevelFor, isKnownRisk } from '../utils/riskUtils';
import { colors, radius, spacing, typography, riskPalette } from '../theme/theme';

const LEVELS = ['Low', 'Moderate', 'High'];

// One screen serves both flood and haze guidance - the type comes from the
// navigation params. The two screens were identical apart from their text,
// so building them separately would have meant maintaining the same layout
// twice.
export default function GuidanceScreen({ navigation, route }) {
  const { environment } = useApp();
  const type = route.params?.type === 'haze' ? 'haze' : 'flood';
  const content = guidance[type];

  const actualRisk = environment[type].risk;
  const detail = environment[type].detail;

  // Lets the user read the guidance for any level, not just their current
  // one. This is deliberately local state: an earlier version passed the
  // real risk setters down here, which meant tapping "Low" to read the
  // advice permanently overwrote the measured risk on the dashboard.
  const [previewLevel, setPreviewLevel] = useState(null);

  const displayedLevel = previewLevel ?? guidanceLevelFor(actualRisk);
  const isPreviewing = previewLevel !== null && previewLevel !== actualRisk;
  const palette = riskPalette(isPreviewing ? previewLevel : actualRisk);

  const actions = content.actions[displayedLevel];

  return (
    <ScreenContainer
      title={content.title}
      subtitle={content.subtitle}
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
      <View
        style={[
          styles.riskPanel,
          { backgroundColor: palette.bg, borderColor: palette.border },
        ]}
      >
        <Text style={styles.riskLabel}>{content.riskTitle}</Text>
        <Text style={[styles.riskLevel, { color: palette.text }]}>
          {isKnownRisk(actualRisk) ? `${actualRisk} risk` : 'Risk unknown'}
        </Text>
        <Text style={typography.caption}>{detail}</Text>
      </View>

      {/* When live data is unavailable the app says so plainly instead of
          quietly showing Low guidance as though it were measured. */}
      {!isKnownRisk(actualRisk) && !isPreviewing ? (
        <View style={styles.noticeCard}>
          {unavailableGuidance.map((line) => (
            <View key={line} style={styles.noticeRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.noticeText}>{line}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>
        {isPreviewing ? `Guidance for ${previewLevel} risk` : 'What you should do'}
      </Text>

      <View style={styles.actionsCard}>
        {actions.map((action, index) => (
          <View key={action} style={styles.actionRow}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>View guidance for another level</Text>

      <View style={styles.levelRow}>
        {LEVELS.map((level) => {
          const isSelected = displayedLevel === level;
          return (
            <Pressable
              key={level}
              style={[styles.levelChip, isSelected && styles.levelChipSelected]}
              onPress={() => setPreviewLevel(level)}
              accessibilityRole="button"
              accessibilityLabel={`Show guidance for ${level} risk`}
            >
              <Text
                style={[styles.levelText, isSelected && styles.levelTextSelected]}
              >
                {level}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isPreviewing ? (
        <Pressable
          style={styles.resetButton}
          onPress={() => setPreviewLevel(null)}
        >
          <Text style={styles.resetText}>Back to my current risk level</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.sourceCard}
        onPress={() => Linking.openURL(content.sourceUrl)}
        accessibilityRole="link"
        accessibilityLabel={`Open ${content.source}`}
      >
        <Ionicons name="open-outline" size={18} color={colors.primary} />
        <Text style={styles.sourceText}>Official source: {content.source}</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  riskPanel: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  riskLabel: { ...typography.label, marginBottom: spacing.xs },
  riskLevel: { fontSize: 24, fontWeight: '800', marginBottom: spacing.xs },
  noticeCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noticeText: { ...typography.caption, flex: 1, lineHeight: 19 },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  actionsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNumberText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  actionText: { ...typography.body, flex: 1, color: colors.text },
  levelRow: { flexDirection: 'row', gap: spacing.sm },
  levelChip: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  levelChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelText: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  levelTextSelected: { color: '#ffffff' },
  resetButton: { paddingVertical: spacing.md, alignItems: 'center' },
  resetText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  sourceText: { color: colors.primary, fontWeight: '600', flex: 1 },
});