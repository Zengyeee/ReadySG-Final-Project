import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ScreenContainer from '../components/ScreenContainer';
import ProgressBar from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { quizQuestions } from '../data/quizQuestions';
import {
  calculateScore,
  calculatePercentage,
  countAnswered,
  isQuizComplete,
  resultMessage,
} from '../utils/quizUtils';
import { colors, radius, spacing, typography } from '../theme/theme';

export default function LearnScreen() {
  const { quizAnswers, answerQuestion, resetQuiz } = useApp();

  const answered = countAnswered(quizAnswers, quizQuestions);
  const score = calculateScore(quizAnswers, quizQuestions);
  const percentage = calculatePercentage(quizAnswers, quizQuestions);
  const isComplete = isQuizComplete(quizAnswers, quizQuestions);

  return (
    <ScreenContainer
      title="Learn"
      subtitle="Test what you know about staying safe"
    >
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={typography.label}>PROGRESS</Text>
          <Text style={styles.summaryValue}>
            {answered} / {quizQuestions.length}
          </Text>
        </View>
        <ProgressBar
          percentage={(answered / quizQuestions.length) * 100}
        />
        {isComplete ? (
          <Text style={styles.resultText}>
            {score} correct · {percentage}% · {resultMessage(percentage)}
          </Text>
        ) : (
          <Text style={styles.summaryCaption}>
            Answer every question to see your result.
          </Text>
        )}
      </View>

      {quizQuestions.map((question, index) => {
        const selected = quizAnswers[question.id];
        const hasAnswered = selected !== undefined;
        const wasCorrect = selected === question.answer;

        return (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionNumber}>
              Question {index + 1} · {question.topic}
            </Text>
            <Text style={styles.questionText}>{question.question}</Text>

            {question.options.map((option) => {
              const isChosen = selected === option;
              const isAnswer = option === question.answer;

              // Once answered, the correct option is always highlighted -
              // not just the one the user picked. The point is learning
              // the right answer, not only being told you were wrong.
              let optionStyle = styles.option;
              let textStyle = styles.optionText;

              if (hasAnswered && isAnswer) {
                optionStyle = [styles.option, styles.optionCorrect];
                textStyle = [styles.optionText, styles.optionTextCorrect];
              } else if (hasAnswered && isChosen && !isAnswer) {
                optionStyle = [styles.option, styles.optionWrong];
                textStyle = [styles.optionText, styles.optionTextWrong];
              }

              return (
                <Pressable
                  key={option}
                  style={optionStyle}
                  // Locked after answering so a wrong answer cannot be
                  // quietly changed to a right one.
                  disabled={hasAnswered}
                  onPress={() => answerQuestion(question.id, option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isChosen, disabled: hasAnswered }}
                  accessibilityLabel={option}
                >
                  {hasAnswered && isAnswer ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={colors.success}
                    />
                  ) : null}
                  {hasAnswered && isChosen && !isAnswer ? (
                    <Ionicons name="close-circle" size={18} color={colors.danger} />
                  ) : null}
                  <Text style={textStyle}>{option}</Text>
                </Pressable>
              );
            })}

            {hasAnswered ? (
              <View
                style={[
                  styles.explanation,
                  wasCorrect ? styles.explanationCorrect : styles.explanationWrong,
                ]}
              >
                <Text style={styles.explanationLabel}>
                  {wasCorrect ? 'Correct' : 'Not quite'}
                </Text>
                <Text style={styles.explanationText}>{question.explanation}</Text>
              </View>
            ) : null}
          </View>
        );
      })}

      {answered > 0 ? (
        <Pressable
          style={styles.resetButton}
          onPress={resetQuiz}
          accessibilityRole="button"
          accessibilityLabel="Try the quiz again"
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={styles.resetText}>Try again</Text>
        </Pressable>
      ) : null}
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
  resultText: {
    ...typography.bodyStrong,
    color: colors.primary,
    marginTop: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  questionNumber: { ...typography.label, marginBottom: spacing.sm },
  questionText: {
    ...typography.bodyStrong,
    fontSize: 16,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionCorrect: {
    backgroundColor: colors.riskLow.bg,
    borderColor: colors.riskLow.border,
  },
  optionWrong: {
    backgroundColor: colors.riskHigh.bg,
    borderColor: colors.riskHigh.border,
  },
  optionText: { ...typography.body, flex: 1, color: colors.text },
  optionTextCorrect: { color: colors.success, fontWeight: '700' },
  optionTextWrong: { color: colors.danger, fontWeight: '700' },
  explanation: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  explanationCorrect: { backgroundColor: colors.riskLow.bg },
  explanationWrong: { backgroundColor: colors.surfaceAlt },
  explanationLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.textSecondary,
  },
  explanationText: { ...typography.body, color: colors.text, lineHeight: 20 },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  resetText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
});