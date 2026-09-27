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

// Shows the preparedness checklist and the user's progress.
export default function ChecklistScreen() {
  const { completedIds, toggleChecklistItem } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const overallPercentage = calculateProgress(completedIds, checklistItems);
  const completedCount = countCompleted(completedIds, checklistItems);

  // Show all categories or only the category selected by the user.
  const visibleCategories =
    activeCategory === 'all' ? checklistCategories : [activeCategory];

  // Change the category with a simple layout animation.
  function handleCategoryChange(category) {
    animateNextLayout();
    setActiveCategory(category);
  }

  // Update the checklist item and animate the change.
  function handleToggle(itemId) {
    animateNextLayout('spring');
    toggleChecklistItem(itemId);
  }

  return (
    <ScreenContainer
      title="Prepare"
      subtitle="Work through these before an emergency happens"
    >
      {/* Shows the user's overall checklist progress. */}
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

      {/* Buttons used to filter the checklist by category. */}
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

              {/* Show when every task in the category is completed. */}
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

// Styling for the checklist, filters and progress section.
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
    minHeight: touchTarget,
  },
  itemText: { ...typography.body, flex: 1, color: colors.text },
  itemTextDone: { color: colors.textMuted, textDecorationLine: 'line-through' },
  itemPoints: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
});