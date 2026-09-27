import {
  calculateNewRewards,
  earnedBadgeIds,
  badgesWithStatus,
  levelFromPoints,
  pointsToNextLevel,
  itemRewardKey,
  categoryRewardKey,
  quizRewardKey,
  hasBeenAwarded,
  CATEGORY_BONUS,
  QUIZ_PASS_POINTS,
  PERFECT_QUIZ_BONUS,
} from '../../src/utils/gamificationUtils';

const items = [
  { id: 'f1', category: 'Flood', title: 'Flood one', points: 10 },
  { id: 'f2', category: 'Flood', title: 'Flood two', points: 10 },
  { id: 'h1', category: 'Haze', title: 'Haze one', points: 10 },
  { id: 'h2', category: 'Haze', title: 'Haze two', points: 10 },
];

const questions = [
  { id: 'q1', answer: 'a', options: ['a', 'b'], question: '', topic: 'Flood', explanation: '' },
  { id: 'q2', answer: 'c', options: ['c', 'd'], question: '', topic: 'Haze', explanation: '' },
  { id: 'q3', answer: 'e', options: ['e', 'f'], question: '', topic: 'Emergency', explanation: '' },
  { id: 'q4', answer: 'g', options: ['g', 'h'], question: '', topic: 'Flood', explanation: '' },
];

describe('reward keys', () => {
  // Check that each type of reward uses its own key.
  test('item keys are namespaced', () =>
    expect(itemRewardKey('f1')).toBe('item:f1'));
  test('category keys are namespaced', () =>
    expect(categoryRewardKey('Flood')).toBe('category:Flood'));
  test('quiz keys are namespaced', () =>
    expect(quizRewardKey('pass')).toBe('quiz:pass'));
  test('hasBeenAwarded finds an existing key', () =>
    expect(hasBeenAwarded(['item:f1'], 'item:f1')).toBe(true));
  test('hasBeenAwarded rejects a missing key', () =>
    expect(hasBeenAwarded([], 'item:f1')).toBe(false));
});

describe('calculateNewRewards', () => {
  test('awards points for newly completed items', () => {
    const result = calculateNewRewards({
      awardedRewards: [],
      completedIds: ['f1'],
      quizAnswers: {},
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(10);
    expect(result.newlyAwarded).toContain('item:f1');
  });

  // A completed item should only give points once.
  test('does not award the same item twice', () => {
    const result = calculateNewRewards({
      awardedRewards: ['item:f1'],
      completedIds: ['f1'],
      quizAnswers: {},
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(0);
    expect(result.newlyAwarded).toEqual([]);
  });

  test('adds the category bonus when a category is finished', () => {
    const result = calculateNewRewards({
      awardedRewards: [],
      completedIds: ['f1', 'f2'],
      quizAnswers: {},
      questions,
      items,
    });
    // Points include both completed items and the category bonus.
    expect(result.pointsEarned).toBe(20 + CATEGORY_BONUS);
    expect(result.newlyAwarded).toContain('category:Flood');
  });

  test('does not award a category bonus twice', () => {
    const result = calculateNewRewards({
      awardedRewards: ['item:f1', 'item:f2', 'category:Flood'],
      completedIds: ['f1', 'f2'],
      quizAnswers: {},
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(0);
  });

  test('awards quiz points for a pass', () => {
    const result = calculateNewRewards({
      awardedRewards: [],
      completedIds: [],
      quizAnswers: { q1: 'a', q2: 'c', q3: 'e' },
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(QUIZ_PASS_POINTS);
  });

  test('adds a bonus for a perfect score', () => {
    const result = calculateNewRewards({
      awardedRewards: [],
      completedIds: [],
      quizAnswers: { q1: 'a', q2: 'c', q3: 'e', q4: 'g' },
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(QUIZ_PASS_POINTS + PERFECT_QUIZ_BONUS);
  });

  test('a failing score earns nothing', () => {
    const result = calculateNewRewards({
      awardedRewards: [],
      completedIds: [],
      quizAnswers: { q1: 'a' },
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(0);
  });

  // Quiz rewards should not be given again after a retake.
  test('does not award quiz points twice', () => {
    const result = calculateNewRewards({
      awardedRewards: ['quiz:pass'],
      completedIds: [],
      quizAnswers: { q1: 'a', q2: 'c', q3: 'e' },
      questions,
      items,
    });
    expect(result.pointsEarned).toBe(0);
  });
});

describe('earnedBadgeIds', () => {
  // Badges are earned based on checklist and quiz progress.
  test('flood badge for a finished flood category', () => {
    const earned = earnedBadgeIds({
      completedIds: ['f1', 'f2'],
      quizAnswers: {},
      questions,
      items,
    });
    expect(earned).toContain('flood-ready');
    expect(earned).not.toContain('haze-ready');
  });

  test('scholar badge for passing the quiz', () => {
    const earned = earnedBadgeIds({
      completedIds: [],
      quizAnswers: { q1: 'a', q2: 'c', q3: 'e' },
      questions,
      items,
    });
    expect(earned).toContain('safety-scholar');
  });

  test('champion badge needs the checklist and the quiz', () => {
    const earned = earnedBadgeIds({
      completedIds: ['f1', 'f2', 'h1', 'h2'],
      quizAnswers: { q1: 'a', q2: 'c', q3: 'e' },
      questions,
      items,
    });
    expect(earned).toContain('preparedness-champion');
  });

  test('champion badge is withheld if the quiz was not passed', () => {
    const earned = earnedBadgeIds({
      completedIds: ['f1', 'f2', 'h1', 'h2'],
      quizAnswers: { q1: 'a' },
      questions,
      items,
    });
    expect(earned).not.toContain('preparedness-champion');
  });

  test('a new user has no badges', () => {
    const earned = earnedBadgeIds({
      completedIds: [],
      quizAnswers: {},
      questions,
      items,
    });
    expect(earned).toEqual([]);
  });
});

describe('badgesWithStatus', () => {
  test('marks earned badges', () => {
    const result = badgesWithStatus(['flood-ready']);
    const flood = result.find((b) => b.id === 'flood-ready');
    const haze = result.find((b) => b.id === 'haze-ready');
    expect(flood.isEarned).toBe(true);
    expect(haze.isEarned).toBe(false);
  });

  // Locked badges should still appear so users can see their progress.
  test('always returns every badge so locked ones stay visible', () => {
    expect(badgesWithStatus([])).toHaveLength(4);
  });
});

describe('levelFromPoints', () => {
  // Check that the correct level is returned for different point totals.
  test('zero points is not started', () =>
    expect(levelFromPoints(0).level).toBe(0));
  test('25 points reaches level 1', () =>
    expect(levelFromPoints(25).level).toBe(1));
  test('75 points reaches level 2', () =>
    expect(levelFromPoints(75).level).toBe(2));
  test('150 points reaches level 3', () =>
    expect(levelFromPoints(150).level).toBe(3));
  test('250 points reaches level 4', () =>
    expect(levelFromPoints(250).level).toBe(4));
  test('levels have titles', () =>
    expect(levelFromPoints(250).title).toBe('Preparedness Champion'));
});

describe('pointsToNextLevel', () => {
  test('counts down to the next threshold', () =>
    expect(pointsToNextLevel(10)).toBe(15));
  test('returns 0 at the maximum level', () =>
    expect(pointsToNextLevel(300)).toBe(0));
});