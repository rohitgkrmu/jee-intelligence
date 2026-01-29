import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getMockTestQuestions } from "@/lib/mock-test";
import { estimatePercentile } from "@/lib/mock-test/scoring";
import { ReportView } from "./report-view";
import type { AnswerState } from "@/lib/mock-test/types";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Your JEE Mains Mock Test Report",
    description:
      "View your detailed JEE Mains mock test results, subject-wise analysis, and performance insights.",
    robots: "noindex, nofollow",
  };
}

export default async function MockTestReportPage({ params }: Props) {
  const { token } = await params;

  const attempt = await prisma.mockTestAttempt.findUnique({
    where: { reportToken: token },
    include: {
      mockTest: true,
      lead: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!attempt) {
    notFound();
  }

  if (attempt.status !== "COMPLETED") {
    notFound();
  }

  // Get questions with correct answers for detailed analysis
  const questions = await getMockTestQuestions({
    physics: attempt.physicsQuestions,
    chemistry: attempt.chemistryQuestions,
    mathematics: attempt.mathQuestions,
  });

  const answers =
    (attempt.answers as Record<
      string,
      { answer: string; timeSpent: number; savedAt: string }
    >) || {};

  // Convert to AnswerState format
  const answersMap: Record<string, AnswerState> = {};
  for (const [questionId, answer] of Object.entries(answers)) {
    answersMap[questionId] = {
      answer: answer.answer,
      timeSpent: answer.timeSpent,
      savedAt: new Date(answer.savedAt),
    };
  }

  // Build detailed question analysis
  const buildQuestionAnalysis = (
    subjectQuestions: typeof questions.physics
  ) => {
    return subjectQuestions.map((q) => {
      const userAnswer = answersMap[q.id]?.answer?.trim() || null;
      const isCorrect = userAnswer
        ? checkAnswer(q.correctAnswer, userAnswer, q.questionType)
        : null;

      return {
        id: q.id,
        questionNumber: q.questionNumber,
        sectionType: q.sectionType,
        chapter: q.chapter,
        difficulty: q.difficulty,
        questionType: q.questionType,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isCorrect,
        solution: q.solution,
        timeSpent: answersMap[q.id]?.timeSpent || 0,
      };
    });
  };

  const physicsAnalysis = buildQuestionAnalysis(questions.physics);
  const chemistryAnalysis = buildQuestionAnalysis(questions.chemistry);
  const mathAnalysis = buildQuestionAnalysis(questions.mathematics);

  // Calculate max score
  const maxScore =
    questions.physics.length * 4 +
    questions.chemistry.length * 4 +
    questions.mathematics.length * 4;

  // Calculate percentile
  const percentile = estimatePercentile(attempt.totalScore || 0, maxScore);

  // Chapter-wise analysis
  const chapterAnalysis = buildChapterAnalysis([
    ...physicsAnalysis,
    ...chemistryAnalysis,
    ...mathAnalysis,
  ]);

  const report = {
    attemptId: attempt.id,
    mockTestName: attempt.mockTest.name,
    candidateName: attempt.lead.name,

    // Overall scores
    totalScore: attempt.totalScore,
    maxScore,
    percentile,
    rank: null,

    // Subject scores
    physicsScore: attempt.physicsScore,
    chemistryScore: attempt.chemistryScore,
    mathScore: attempt.mathScore,

    // Counts
    totalQuestions:
      attempt.physicsQuestions.length +
      attempt.chemistryQuestions.length +
      attempt.mathQuestions.length,
    correctCount: attempt.correctCount,
    incorrectCount: attempt.incorrectCount,
    unansweredCount: attempt.unansweredCount,

    // Time
    totalTimeSeconds: attempt.totalTimeSeconds,
    duration: attempt.mockTest.duration,
    startedAt: attempt.startedAt.toISOString(),
    completedAt: attempt.completedAt?.toISOString(),

    // Detailed analysis
    questions: {
      physics: physicsAnalysis,
      chemistry: chemistryAnalysis,
      mathematics: mathAnalysis,
    },

    // Chapter analysis
    chapterAnalysis,
  };

  return <ReportView report={report} />;
}

function checkAnswer(
  correctAnswer: string,
  userAnswer: string,
  questionType: string
): boolean {
  if (questionType === "NUMERICAL" || questionType === "INTEGER") {
    const correct = parseFloat(correctAnswer);
    const user = parseFloat(userAnswer);

    if (isNaN(correct) || isNaN(user)) {
      return correctAnswer.trim() === userAnswer.trim();
    }

    if (Number.isInteger(correct)) {
      return Math.round(user) === correct;
    }

    const tolerance = Math.max(Math.abs(correct * 0.01), 0.01);
    return Math.abs(correct - user) <= tolerance;
  }

  return correctAnswer.toLowerCase() === userAnswer.toLowerCase();
}

interface QuestionAnalysis {
  chapter: string;
  difficulty: string;
  isCorrect: boolean | null;
}

function buildChapterAnalysis(questions: QuestionAnalysis[]) {
  const chapters: Record<
    string,
    {
      total: number;
      correct: number;
      incorrect: number;
      unanswered: number;
    }
  > = {};

  for (const q of questions) {
    if (!chapters[q.chapter]) {
      chapters[q.chapter] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
      };
    }

    chapters[q.chapter].total++;

    if (q.isCorrect === true) {
      chapters[q.chapter].correct++;
    } else if (q.isCorrect === false) {
      chapters[q.chapter].incorrect++;
    } else {
      chapters[q.chapter].unanswered++;
    }
  }

  return Object.entries(chapters)
    .map(([chapter, stats]) => ({
      chapter,
      ...stats,
      accuracy:
        stats.correct + stats.incorrect > 0
          ? Math.round(
              (stats.correct / (stats.correct + stats.incorrect)) * 100
            )
          : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
