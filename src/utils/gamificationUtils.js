// Handles the points, badges and levels used in the app.

import { checklistItems } from '../data/checklistItems';
import { quizQuestions } from '../data/quizQuestions';
import { badges } from '../data/badges';
import { isCategoryComplete, isChecklistComplete } from './progressUtils';
import { calculatePercentage, PASS_PERCENTAGE } from './quizUtils';

// Extra points given for completing categories and quizzes.
export const CATEGORY_BONUS = 25;
export const QUIZ_PASS_POINTS = 50;
export const PERFECT_QUIZ_BONUS = 25;

// Create different keys for each type of reward.
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

// Calculate new rewards that the user has not received before.
export function calculateNewRewards({
  awardedRewards = [],
  completedIds = [],
  quizAnswers = {},
  questions = quizQuestions,
  items = checklistItems,
} = {}) {
  let pointsEarned = 0;
  const newlyAwarded = [];

  // Give points for newly completed checklist items.
  items.forEach((item) => {
    if (!completedIds.includes(item.id)) return;
    const key = itemRewardKey(item.id);
    if (hasBeenAwarded(awardedRewards, key)) return;

    pointsEarned += item.points;
    newlyAwarded.push(key);
  });

  // Give bonus points when a whole category is completed.
  ['General', 'Flood', 'Haze'].forEach((category) => {
    if (!isCategoryComplete(completedIds, items, category)) return;
    const key = categoryRewardKey(category);
    if (hasBeenAwarded(awardedRewards, key)) return;

    pointsEarned += CATEGORY_BONUS;
    newlyAwarded.push(key);
  });

  // Give points for passing or getting a perfect quiz score.
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

// Check which badges the user has earned.
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

  // The final badge needs the checklist and quiz to be completed.
  if (isChecklistComplete(completedIds, items) && percentage >= PASS_PERCENTAGE) {
    earned.push('preparedness-champion');
  }

  return earned;
}

// Add the earned or locked status to each badge.
export function badgesWithStatus(earnedIds = []) {
  return badges.map((badge) => ({
    ...badge,
    isEarned: earnedIds.includes(badge.id),
  }));
}

// Decide the user's level based on their total points.
export function levelFromPoints(points = 0) {
  if (points >= 250) return { level: 4, title: 'Preparedness Champion' };
  if (points >= 150) return { level: 3, title: 'Prepared' };
  if (points >= 75) return { level: 2, title: 'Getting Ready' };
  if (points >= 25) return { level: 1, title: 'Starting Out' };
  return { level: 0, title: 'Not Started' };
}

// Calculate how many points are needed for the next level.
export function pointsToNextLevel(points = 0) {
  const thresholds = [25, 75, 150, 250];
  const next = thresholds.find((threshold) => points < threshold);
  return next === undefined ? 0 : next - points;
}

// Calculate the maximum number of points that can be earned.
export function totalPossiblePoints(items = checklistItems) {
  const itemPoints = items.reduce((sum, item) => sum + item.points, 0);
  const categoryBonuses = CATEGORY_BONUS * 3;
  return itemPoints + categoryBonuses + QUIZ_PASS_POINTS + PERFECT_QUIZ_BONUS;
}