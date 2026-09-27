// Checklist progress calculations. All pure functions, so the screens only
// have to display the result rather than work anything out themselves.

// Percentage completed, rounded to a whole number. Returns 0 rather than
// NaN when there are no items, which would otherwise show up on screen the
// first time a new user opens the app.
export function calculateProgress(completedIds, items) {
  if (items.length === 0) return 0;

  // Counting against the real item list means old saved ids left over from
  // a previous version of the checklist cannot inflate the percentage.
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

// Progress within one category, used by the Flood Ready and Haze Ready
// badges.
export function categoryProgress(completedIds, items, category) {
  const categoryItems = itemsInCategory(items, category);
  const completed = countCompleted(completedIds, categoryItems);

  return {
    category,
    completed,
    total: categoryItems.length,
    percentage: calculateProgress(completedIds, categoryItems),
    // An empty category must not count as complete, otherwise a badge
    // could unlock without the user doing anything.
    isComplete: categoryItems.length > 0 && completed === categoryItems.length,
  };
}

export function isCategoryComplete(completedIds, items, category) {
  return categoryProgress(completedIds, items, category).isComplete;
}

export function isChecklistComplete(completedIds, items) {
  return items.length > 0 && countCompleted(completedIds, items) === items.length;
}

// Adds or removes an id. Returns a new array rather than changing the old
// one, because mutating state in place stops React from re-rendering.
export function toggleItem(completedIds, itemId) {
  return completedIds.includes(itemId)
    ? completedIds.filter((id) => id !== itemId)
    : [...completedIds, itemId];
}