// Functions used to calculate the user's quiz score.

export function isCorrect(question, answer) {
  return question.answer === answer;
}

export function calculateScore(answers = {}, questions = []) {
  return questions.filter((q) => answers[q.id] === q.answer).length;
}

// Calculate the quiz score as a percentage.
export function calculatePercentage(answers = {}, questions = []) {
  // Empty quiz should return 0 instead of an invalid percentage.
  if (questions.length === 0) return 0;

  return Math.round(
    (calculateScore(answers, questions) / questions.length) * 100
  );
}

export function countAnswered(answers = {}, questions = []) {
  // Only count answers for questions that are still in the quiz.
  return questions.filter((q) => answers[q.id] !== undefined).length;
}

export function isQuizComplete(answers = {}, questions = []) {
  return (
    questions.length > 0 && countAnswered(answers, questions) === questions.length
  );
}

// Keep the highest score even if the user gets a lower score later.
export function updateBestScore(previousBest, newScore) {
  return Math.max(previousBest, newScore);
}

// User needs at least 75% to pass the quiz.
export const PASS_PERCENTAGE = 75;

export function hasPassed(answers = {}, questions = []) {
  return calculatePercentage(answers, questions) >= PASS_PERCENTAGE;
}

// Show different feedback depending on the user's score.
export function resultMessage(percentage) {
  if (percentage === 100) return 'Perfect score. You know your safety basics.';
  if (percentage >= PASS_PERCENTAGE) return 'Well done. You are safety ready.';
  if (percentage >= 50) return 'Not bad. Review the explanations and try again.';
  return 'Worth another go. Read the explanations carefully.';
}