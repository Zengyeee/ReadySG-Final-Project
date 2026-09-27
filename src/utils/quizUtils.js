// Quiz scoring. Kept separate from the screen so the marking rules can be
// tested directly rather than by tapping through eight questions each time.

export function isCorrect(question, answer) {
  return question.answer === answer;
}

export function calculateScore(answers = {}, questions = []) {
  return questions.filter((q) => answers[q.id] === q.answer).length;
}

// Score as a percentage. Returns 0 rather than NaN for an empty quiz, and
// the default arguments stop a missing list crashing the whole app - an
// undefined questions list should read as "no score yet", not a crash.
export function calculatePercentage(answers = {}, questions = []) {
  if (questions.length === 0) return 0;
  return Math.round(
    (calculateScore(answers, questions) / questions.length) * 100
  );
}

export function countAnswered(answers = {}, questions = []) {
  // Counted against the question list so answers to removed questions are
  // ignored rather than making the quiz look further along than it is.
  return questions.filter((q) => answers[q.id] !== undefined).length;
}

export function isQuizComplete(answers = {}, questions = []) {
  return (
    questions.length > 0 && countAnswered(answers, questions) === questions.length
  );
}

// The best score never goes down - a worse later attempt does not wipe out
// an earlier good one.
export function updateBestScore(previousBest, newScore) {
  return Math.max(previousBest, newScore);
}

// The Safety Scholar threshold. Defined here so the results screen and the
// badge logic can never disagree about what counts as a pass.
export const PASS_PERCENTAGE = 75;

export function hasPassed(answers = {}, questions = []) {
  return calculatePercentage(answers, questions) >= PASS_PERCENTAGE;
}

export function resultMessage(percentage) {
  if (percentage === 100) return 'Perfect score. You know your safety basics.';
  if (percentage >= PASS_PERCENTAGE) return 'Well done. You are safety ready.';
  if (percentage >= 50) return 'Not bad. Review the explanations and try again.';
  return 'Worth another go. Read the explanations carefully.';
}