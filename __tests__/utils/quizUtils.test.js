import {
  isCorrect,
  calculateScore,
  calculatePercentage,
  countAnswered,
  isQuizComplete,
  updateBestScore,
  hasPassed,
  resultMessage,
  PASS_PERCENTAGE,
} from '../../src/utils/quizUtils';

// Sample questions used to test the quiz functions.
const questions = [
  { id: 'q1', topic: 'Flood', question: 'Q1', options: ['a', 'b'], answer: 'a', explanation: '' },
  { id: 'q2', topic: 'Haze', question: 'Q2', options: ['c', 'd'], answer: 'c', explanation: '' },
  { id: 'q3', topic: 'Emergency', question: 'Q3', options: ['e', 'f'], answer: 'e', explanation: '' },
  { id: 'q4', topic: 'Flood', question: 'Q4', options: ['g', 'h'], answer: 'g', explanation: '' },
];

describe('isCorrect', () => {
  test('accepts the right answer', () =>
    expect(isCorrect(questions[0], 'a')).toBe(true));
  test('rejects a wrong answer', () =>
    expect(isCorrect(questions[0], 'b')).toBe(false));
});

describe('calculateScore', () => {
  // Check that only correct answers are added to the score.
  test('counts correct answers only', () =>
    expect(calculateScore({ q1: 'a', q2: 'd', q3: 'e' }, questions)).toBe(2));
  test('no answers scores 0', () => expect(calculateScore({}, questions)).toBe(0));
  test('all correct scores full marks', () =>
    expect(calculateScore({ q1: 'a', q2: 'c', q3: 'e', q4: 'g' }, questions)).toBe(4));
});

describe('calculatePercentage', () => {
  test('half correct is 50%', () =>
    expect(calculatePercentage({ q1: 'a', q2: 'c' }, questions)).toBe(50));
  test('all correct is 100%', () =>
    expect(
      calculatePercentage({ q1: 'a', q2: 'c', q3: 'e', q4: 'g' }, questions)
    ).toBe(100));
  test('rounds to a whole number', () =>
    expect(calculatePercentage({ q1: 'a' }, questions)).toBe(25));

  // Empty quiz should return 0 instead of an invalid percentage.
  test('an empty quiz returns 0 rather than NaN', () =>
    expect(calculatePercentage({}, [])).toBe(0));
});

describe('countAnswered', () => {
  test('counts answered questions', () =>
    expect(countAnswered({ q1: 'a', q2: 'd' }, questions)).toBe(2));

  // Old saved answers should not count if the question no longer exists.
  test('ignores answers to questions that no longer exist', () =>
    expect(countAnswered({ q1: 'a', removed: 'x' }, questions)).toBe(1));
});

describe('isQuizComplete', () => {
  // Quiz is complete only when every question has an answer.
  test('true when every question is answered', () =>
    expect(isQuizComplete({ q1: 'a', q2: 'b', q3: 'f', q4: 'h' }, questions)).toBe(
      true
    ));
  test('false when one is unanswered', () =>
    expect(isQuizComplete({ q1: 'a', q2: 'b' }, questions)).toBe(false));
  test('an empty quiz is not complete', () =>
    expect(isQuizComplete({}, [])).toBe(false));
});

describe('updateBestScore', () => {
  test('a better score replaces the old one', () =>
    expect(updateBestScore(2, 4)).toBe(4));

  // Keep the highest score even if the user gets a lower score later.
  test('a worse score does not lower the best', () =>
    expect(updateBestScore(4, 1)).toBe(4));
  test('an equal score leaves it unchanged', () =>
    expect(updateBestScore(3, 3)).toBe(3));
});

describe('hasPassed', () => {
  // User needs at least 75% to pass the quiz.
  test('75% passes', () =>
    expect(hasPassed({ q1: 'a', q2: 'c', q3: 'e' }, questions)).toBe(true));
  test('50% does not pass', () =>
    expect(hasPassed({ q1: 'a', q2: 'c' }, questions)).toBe(false));
  test('the threshold is 75', () => expect(PASS_PERCENTAGE).toBe(75));
});

describe('resultMessage', () => {
  // Check that different results show the correct feedback message.
  test('perfect score', () => expect(resultMessage(100)).toContain('Perfect'));
  test('passing score', () => expect(resultMessage(75)).toContain('Well done'));
  test('middling score', () => expect(resultMessage(50)).toContain('Not bad'));
  test('low score', () => expect(resultMessage(25)).toContain('another go'));
});