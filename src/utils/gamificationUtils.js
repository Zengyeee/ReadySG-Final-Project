// Points and badges. The rule that shapes this whole file: a reward can
// only ever be earned once. Without that, a user could untick and retick
// the same checklist item to farm points indefinitely, which would make
// the score meaningless.

import { checklistItems } from '../data/checklistItems';
import { quizQuestions } from '../data/quizQuestions';
import { badges } from '../data/badges';
import { isCategoryComplete, isChecklistComplete } from './progressUtils';
import { calculatePercentage, PASS_PERCENTAGE } from './quizUtils';

// Bonus for finishing an entire category, on top of the per-item points.
export const CATEGORY_BONUS = 25;
export const QUIZ_PASS_POINTS = 50;
export const PERFECT_QUIZ_BONUS = 25;

// Reward keys are strings so they can be stored as a simple array and
// checked with includes().
export function itemRewardKey(itemId) {
  return `item:${itemId}`;
}

export function categoryRewardKey(category) {
  return `category:${category}`;
}

export function quizRewardKey(kind) {
  return `quiz:${kind}`;
}

export function badgeRewardKey(badgeId) {
  return `badge:${badgeId}`;
}

export function hasBeenAwarded(awardedRewards = [], key) {
  return awardedRewards.includes(key);
}

// Works out what a user has earned that they have not already been given.
// Returns the new points and the keys to record rather than changing
// anything, so the caller decides when to save.
export function calculateNewRewards({
  awardedRewards = [],
  completedIds = [],
  quizAnswers = {},
  questions = quizQuestions,
  items = checklistItems,
} = {}) {
  let pointsEarned = 0;
  const newlyAwarded = [];

  // Points for each newly completed checklist item.
  items.forEach((item) => {
    if (!completedIds.includes(item.id)) return;
    const key = itemRewardKey(item.id);
    if (hasBeenAwarded(awardedRewards, key)) return;

    pointsEarned += item.points;
    newlyAwarded.push(key);
  });

  // Bonus for completing a whole category.
  ['General', 'Flood', 'Haze'].forEach((category) => {
    if (!isCategoryComplete(completedIds, items, category)) return;
    const key = categoryRewardKey(category);
    if (hasBeenAwarded(awardedRewards, key)) return;

    pointsEarned += CATEGORY_BONUS;
    newlyAwarded.push(key);
  });

  // Quiz rewards.
  const percentage = calculatePercentage(quizAnswers, questions);

  if (percentage >= PASS_PERCENTAGE) {
    const key = quizRewardKey('pass');
    if (!hasBeenAwarded(awardedRewards, key)) {
      pointsEarned += QUIZ_PASS_POINTS;
      newlyAwarded.push(key);
    }
  }

  if (percentage === 100) {
    const key = quizRewardKey('perfect');
    if (!hasBeenAwarded(awardedRewards, key)) {
      pointsEarned += PERFECT_QUIZ_BONUS;
      newlyAwarded.push(key);
    }
  }

  return { pointsEarned, newlyAwarded };
}

// Which badges the user currently qualifies for. Separate from points
// because a badge is a status rather than a one-off award, so it is
// recalculated from the data instead of being stored.
export function earnedBadgeIds({
  completedIds = [],
  quizAnswers = {},
  questions = quizQuestions,
  items = checklistItems,
} = {}) {
  const earned = [];
  const percentage = calculatePercentage(quizAnswers, questions);

  if (isCategoryComplete(completedIds, items, 'Flood')) earned.push('flood-ready');
  if (isCategoryComplete(completedIds, items, 'Haze')) earned.push('haze-ready');
  if (percentage >= PASS_PERCENTAGE) earned.push('safety-scholar');

  // The champion badge needs both halves of the app finished.
  if (isChecklistComplete(completedIds, items) && percentage >= PASS_PERCENTAGE) {
    earned.push('preparedness-champion');
  }

  return earned;
}

// Badge objects with their locked or unlocked state, ready for display.
export function badgesWithStatus(earnedIds = []) {
  return badges.map((badge) => ({
    ...badge,
    isEarned: earnedIds.includes(badge.id),
  }));
}

// A simple level from total points, so progress feels visible early on
// rather than only at the very end.
export function levelFromPoints(points = 0) {
  if (points >= 250) return { level: 4, title: 'Preparedness Champion' };
  if (points >= 150) return { level: 3, title: 'Prepared' };
  if (points >= 75) return { level: 2, title: 'Getting Ready' };
  if (points >= 25) return { level: 1, title: 'Starting Out' };
  return { level: 0, title: 'Not Started' };
}

// Points still needed for the next level, for a progress bar.
export function pointsToNextLevel(points = 0) {
  const thresholds = [25, 75, 150, 250];
  const next = thresholds.find((threshold) => points < threshold);
  return next === undefined ? 0 : next - points;
}

export function totalPossiblePoints(items = checklistItems) {
  const itemPoints = items.reduce((sum, item) => sum + item.points, 0);
  const categoryBonuses = CATEGORY_BONUS * 3;
  return itemPoints + categoryBonuses + QUIZ_PASS_POINTS + PERFECT_QUIZ_BONUS;
}