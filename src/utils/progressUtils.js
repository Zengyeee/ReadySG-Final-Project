// Functions used to calculate checklist progress.

export function calculateProgress(completedIds, items) {
  // Empty checklist should return 0 instead of an invalid result.
  if (items.length === 0) return 0;

  // Only count completed items that are still in the checklist.
  const completedCount = items.filter((item) =>
    completedIds.includes(item.id)
  ).length;

  return Math.round((completedCount / items.length) * 100);
}

export function countCompleted(completedIds, items) {
  return items.filter((item) => completedIds.includes(item.id)).length;
}

export function itemsInCategory(items, category) {
  return items.filter((item) => item.category === category);
}

// Calculate the user's progress for one checklist category.
export function categoryProgress(completedIds, items, category) {
  const categoryItems = itemsInCategory(items, category);
  const completed = countCompleted(completedIds, categoryItems);

  return {
    category,
    completed,
    total: categoryItems.length,
    percentage: calculateProgress(completedIds, categoryItems),

    // An empty category should not be treated as completed.
    isComplete: categoryItems.length > 0 && completed === categoryItems.length,
  };
}

export function isCategoryComplete(completedIds, items, category) {
  return categoryProgress(completedIds, items, category).isComplete;
}

export function isChecklistComplete(completedIds, items) {
  return items.length > 0 && countCompleted(completedIds, items) === items.length;
}

// Add or remove a completed checklist item.
export function toggleItem(completedIds, itemId) {
  return completedIds.includes(itemId)
    ? completedIds.filter((id) => id !== itemId)
    : [...completedIds, itemId];
}