import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { checklistItems, checklistCategories } from '../data/checklistItems';
import {
  calculateProgress,
  countCompleted,
  itemsInCategory,
  categoryProgress,
} from '../utils/progressUtils';
import { animateNextLayout } from '../utils/animationUtils';
import { colors, radius, spacing, typography, touchTarget } from '../theme/theme';

export default function ChecklistScreen() {
  const { completedIds, toggleChecklistItem } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const overallPercentage = calculateProgress(completedIds, checklistItems);
  const completedCount = countCompleted(completedIds, checklistItems);

  const visibleCategories =
    activeCategory === 'all' ? checklistCategories : [activeCategory];

  // Switching category adds or removes whole blocks of rows. Without the
  // animation the list snaps abruptly, which makes it hard to tell what
  // changed. LayoutAnimation handles the transition for free.
  function handleCategoryChange(category) {
    animateNextLayout();
    setActiveCategory(category);
  }

  // Ticking an item changes its height slightly as the strikethrough and
  // colour change, so the same animation smooths that too.
  function handleToggle(itemId) {
    animateNextLayout('spring');
    toggleChecklistItem(itemId);
  }

  return (
    <ScreenContainer
      title="Prepare"
      subtitle="Work through these before an emergency happens"
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={typography.label}>OVERALL PROGRESS</Text>
          <Text style={styles.summaryValue}>{overallPercentage}%</Text>
        </View>
        <ProgressBar percentage={overallPercentage} />
        <Text style={styles.summaryCaption}>
          {completedCount} of {checklistItems.length} tasks completed
        </Text>
      </View>

      <View style={styles.chipRow}>
        {['all', ...checklistCategories].map((category) => {
          const isSelected = activeCategory === category;
          return (
            <Pressable
              key={category}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleCategoryChange(category)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Show ${category === 'all' ? 'all' : category} tasks`}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {category === 'all' ? 'All' : category}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visibleCategories.map((category) => {
        const progress = categoryProgress(completedIds, checklistItems, category);
        const items = itemsInCategory(checklistItems, category);

        return (
          <View key={category} style={styles.categoryBlock}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {/* A tick on the heading gives immediate feedback that a
                  whole category is done, which is also what unlocks the
                  matching badge. */}
              {progress.isComplete ? (
                <View style={styles.completeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text style={styles.completeText}>Complete</Text>
                </View>
              ) : (
                <Text style={typography.caption}>
                  {progress.completed} of {progress.total}
                </Text>
              )}
            </View>

            {items.map((item) => {
              const isDone = completedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => handleToggle(item.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isDone }}
                  accessibilityLabel={item.title}
                  testID={`checklist-item-${item.id}`}
                >
                  <Ionicons
                    name={isDone ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isDone ? colors.primary : colors.textMuted}
                  />
                  <Text style={[styles.itemText, isDone && styles.itemTextDone]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemPoints}>+{item.points}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  summaryCaption: { ...typography.caption, marginTop: spacing.sm },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextSelected: { color: '#ffffff' },
  categoryBlock: { marginTop: spacing.xl },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryTitle: { ...typography.heading },
  completeBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  completeText: { fontSize: 12, fontWeight: '700', color: colors.success },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    // Keeps every row comfortably tappable on a real phone.
    minHeight: touchTarget,
  },
  itemText: { ...typography.body, flex: 1, color: colors.text },
  itemTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  itemPoints: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
});