import type { Subject } from "@prisma/client";
import type { MockTestQuestion, SubjectScore, AnswerState } from "./types";
import { SCORING } from "./types";

interface ScoreInput {
  questions: {
    physics: MockTestQuestion[];
    chemistry: MockTestQuestion[];
    mathematics: MockTestQuestion[];
  };
  answers: Record<string, AnswerState>;
}

interface ScoreResult {
  physicsScore: SubjectScore;
  chemistryScore: SubjectScore;
  mathScore: SubjectScore;
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
}

/**
 * Calculate scores for a mock test attempt
 *
 * JEE Mains Scoring:
 * - Section A (MCQ): +4 for correct, -1 for incorrect, 0 for unanswered
 * - Section B (Numerical): +4 for correct, 0 for incorrect, 0 for unanswered
 *
 * Note: In actual JEE Mains, only 20 out of 25 questions in each section are mandatory,
 * but for simplicity, we're scoring all 30 questions per subject with the above rules.
 */
export function calculateScores(input: ScoreInput): ScoreResult {
  const physicsScore = calculateSubjectScore("PHYSICS", input.questions.physics, input.answers);
  const chemistryScore = calculateSubjectScore("CHEMISTRY", input.questions.chemistry, input.answers);
  const mathScore = calculateSubjectScore("MATHEMATICS", input.questions.mathematics, input.answers);

  const totalScore = physicsScore.score + chemistryScore.score + mathScore.score;
  const totalCorrect = physicsScore.correct + chemistryScore.correct + mathScore.correct;
  const totalIncorrect = physicsScore.incorrect + chemistryScore.incorrect + mathScore.incorrect;
  const totalUnanswered = physicsScore.unanswered + chemistryScore.unanswered + mathScore.unanswered;

  return {
    physicsScore,
    chemistryScore,
    mathScore,
    totalScore,
    totalCorrect,
    totalIncorrect,
    totalUnanswered,
  };
}

function calculateSubjectScore(
  subject: Subject,
  questions: MockTestQuestion[],
  answers: Record<string, AnswerState>
): SubjectScore {
  let score = 0;
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const sectionA = { correct: 0, incorrect: 0, unanswered: 0 };
  const sectionB = { correct: 0, incorrect: 0, unanswered: 0 };

  for (const question of questions) {
    const answerState = answers[question.id];
    const userAnswer = answerState?.answer?.trim();
    const isNumerical = question.questionType === "NUMERICAL" || question.questionType === "INTEGER";
    const section = question.sectionType === "A" ? sectionA : sectionB;

    if (!userAnswer) {
      // Unanswered
      unanswered++;
      section.unanswered++;
      // No points for unanswered questions
    } else {
      const isCorrect = checkAnswer(question, userAnswer);

      if (isCorrect) {
        correct++;
        section.correct++;
        score += isNumerical ? SCORING.NUMERICAL_CORRECT : SCORING.MCQ_CORRECT;
      } else {
        incorrect++;
        section.incorrect++;
        // Negative marking only for MCQs
        score += isNumerical ? SCORING.NUMERICAL_INCORRECT : SCORING.MCQ_INCORRECT;
      }
    }
  }

  // Calculate max score based on question types
  const mcqCount = questions.filter(
    (q) => q.questionType !== "NUMERICAL" && q.questionType !== "INTEGER"
  ).length;
  const numericalCount = questions.length - mcqCount;
  const maxScore = mcqCount * SCORING.MCQ_CORRECT + numericalCount * SCORING.NUMERICAL_CORRECT;

  return {
    subject,
    score,
    maxScore,
    correct,
    incorrect,
    unanswered,
    sectionA,
    sectionB,
  };
}

/**
 * Check if a user's answer is correct
 */
function checkAnswer(question: MockTestQuestion, userAnswer: string): boolean {
  const correctAnswer = question.correctAnswer.trim();

  if (question.questionType === "NUMERICAL" || question.questionType === "INTEGER") {
    return checkNumericalAnswer(correctAnswer, userAnswer);
  }

  // For MCQ, compare option IDs (case-insensitive)
  return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
}

/**
 * Check numerical answers with tolerance
 * Allows for floating-point comparison with a small tolerance
 */
function checkNumericalAnswer(correctAnswer: string, userAnswer: string): boolean {
  // Try to parse both as numbers
  const correct = parseFloat(correctAnswer);
  const user = parseFloat(userAnswer);

  if (isNaN(correct) || isNaN(user)) {
    // Fallback to string comparison
    return correctAnswer.trim() === userAnswer.trim();
  }

  // For integers, exact match required
  if (Number.isInteger(correct)) {
    return Math.round(user) === correct;
  }

  // For decimals, allow 1% tolerance or within 0.01
  const tolerance = Math.max(Math.abs(correct * 0.01), 0.01);
  return Math.abs(correct - user) <= tolerance;
}

/**
 * Calculate time statistics
 */
export function calculateTimeStats(
  answers: Record<string, AnswerState>,
  totalQuestions: number
): {
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
  questionsWithTime: number;
} {
  let totalTimeSeconds = 0;
  let questionsWithTime = 0;

  for (const answer of Object.values(answers)) {
    if (answer.timeSpent > 0) {
      totalTimeSeconds += answer.timeSpent;
      questionsWithTime++;
    }
  }

  const averageTimePerQuestion =
    questionsWithTime > 0 ? totalTimeSeconds / questionsWithTime : 0;

  return {
    totalTimeSeconds,
    averageTimePerQuestion,
    questionsWithTime,
  };
}

/**
 * Estimate percentile based on score (placeholder - would need actual data)
 */
export function estimatePercentile(totalScore: number, maxScore: number): number {
  // This is a simplified estimation
  // In production, this would be based on actual test data
  const percentage = (totalScore / maxScore) * 100;

  if (percentage >= 90) return 99;
  if (percentage >= 80) return 95;
  if (percentage >= 70) return 90;
  if (percentage >= 60) return 80;
  if (percentage >= 50) return 70;
  if (percentage >= 40) return 50;
  if (percentage >= 30) return 30;
  if (percentage >= 20) return 15;
  return 5;
}
