import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { checklistItems } from '../data/checklistItems';
import { quizQuestions } from '../data/quizQuestions';
import { calculateProgress } from '../utils/progressUtils';
import { calculatePercentage } from '../utils/quizUtils';
import {
  badgesWithStatus,
  levelFromPoints,
  pointsToNextLevel,
  totalPossiblePoints,
} from '../utils/gamificationUtils';
import { colors, radius, spacing, typography } from '../theme/theme';

// Shows the user's points, level, badges and overall preparedness progress.
export default function AchievementsScreen({ navigation }) {
  const { points, earnedBadges, completedIds, quizAnswers } = useApp();

  // Calculate the user's current achievement progress.
  const level = levelFromPoints(points);
  const toNext = pointsToNextLevel(points);
  const maxPoints = totalPossiblePoints();
  const badges = badgesWithStatus(earnedBadges);

  const checklistPercentage = calculateProgress(completedIds, checklistItems);
  const quizPercentage = calculatePercentage(quizAnswers, quizQuestions);

  return (
    <ScreenContainer
      title="Achievements"
      subtitle="Your preparedness progress"
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
      {/* Shows the user's current level and points. */}
      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>CURRENT LEVEL</Text>
        <Text style={styles.levelTitle}>{level.title}</Text>
        <Text style={styles.pointsText}>
          {points} of {maxPoints} points
        </Text>
        <View style={styles.levelProgress}>
          <ProgressBar percentage={(points / maxPoints) * 100} />
        </View>
        <Text style={typography.caption}>
          {toNext > 0
            ? `${toNext} more points to reach the next level`
            : 'You have reached the highest level'}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>BADGES</Text>

      {/* Show both earned and locked badges. */}
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[styles.badgeCard, !badge.isEarned && styles.badgeCardLocked]}
        >
          <Text style={[styles.badgeIcon, !badge.isEarned && styles.lockedIcon]}>
            {badge.icon}
          </Text>

          <View style={styles.badgeText}>
            <View style={styles.badgeTitleRow}>
              <Text
                style={[styles.badgeName, !badge.isEarned && styles.lockedText]}
              >
                {badge.name}
              </Text>
              {badge.isEarned ? (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              ) : (
                <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              )}
            </View>

            {/* Locked badges tell the user how they can unlock them. */}
            <Text style={typography.caption}>
              {badge.isEarned ? badge.description : badge.howToUnlock}
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionLabel}>WHERE YOUR POINTS COME FROM</Text>

      {/* Shows progress from the checklist and safety quiz. */}
      <View style={styles.breakdownCard}>
        <Pressable
          style={styles.breakdownRow}
          onPress={() => navigation.navigate('Prepare')}
        >
          <View style={styles.breakdownText}>
            <Text style={styles.breakdownTitle}>Preparedness checklist</Text>
            <Text style={typography.caption}>{checklistPercentage}% complete</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={styles.divider} />

        <Pressable
          style={styles.breakdownRow}
          onPress={() => navigation.navigate('Learn')}
        >
          <View style={styles.breakdownText}>
            <Text style={styles.breakdownTitle}>Safety quiz</Text>
            <Text style={typography.caption}>
              {quizPercentage > 0 ? `${quizPercentage}% scored` : 'Not attempted yet'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.noteCard}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.textSecondary}
        />
        <Text style={styles.noteText}>
          Points are awarded once per task. Unticking and reticking an item
          does not earn them again.
        </Text>
      </View>
    </ScreenContainer>
  );
}

// Styling for the achievements screen.
const styles = StyleSheet.create({
  levelCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  levelLabel: {
    ...typography.label,
    color: colors.primaryBorder,
    marginBottom: spacing.xs,
  },
  levelTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  pointsText: { color: colors.primaryBorder, fontSize: 14, marginBottom: spacing.md },
  levelProgress: { marginBottom: spacing.sm },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  badgeCardLocked: { backgroundColor: colors.surfaceAlt },
  badgeIcon: { fontSize: 32 },
  lockedIcon: { opacity: 0.35 },
  badgeText: { flex: 1 },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  badgeName: { ...typography.bodyStrong },
  lockedText: { color: colors.textMuted },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  breakdownText: { flex: 1 },
  breakdownTitle: { ...typography.bodyStrong, marginBottom: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  noteText: { ...typography.caption, flex: 1, lineHeight: 19 },
});