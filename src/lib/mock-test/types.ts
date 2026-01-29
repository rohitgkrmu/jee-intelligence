import type { Subject, Difficulty, QuestionType, AttemptStatus } from "@prisma/client";

export type MockTestSubject = "physics" | "chemistry" | "mathematics";

export interface MockTestQuestion {
  id: string;
  subject: Subject;
  chapter: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionText: string;
  options: { id: string; text: string }[] | null;
  correctAnswer: string;
  solution: string | null;
  sectionType: "A" | "B"; // A = MCQ (Q1-20), B = Numerical (Q21-30)
  questionNumber: number; // 1-30 within subject
}

export interface MockTestState {
  attemptId: string;
  mockTestId: string;
  startedAt: Date;
  duration: number; // in seconds
  status: AttemptStatus;

  questions: {
    physics: MockTestQuestion[];
    chemistry: MockTestQuestion[];
    mathematics: MockTestQuestion[];
  };

  currentSubject: MockTestSubject;
  currentIndex: number; // 0-29 within subject

  answers: Record<string, AnswerState>;
  visitedQuestions: Set<string>;
  markedForReview: Set<string>;
}

export interface AnswerState {
  answer: string;
  timeSpent: number; // seconds spent on this question
  savedAt: Date;
}

export interface QuestionStatus {
  id: string;
  status: "not_visited" | "visited" | "answered" | "marked" | "answered_marked";
}

export interface SubjectScore {
  subject: Subject;
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  sectionA: {
    correct: number;
    incorrect: number;
    unanswered: number;
  };
  sectionB: {
    correct: number;
    incorrect: number;
    unanswered: number;
  };
}

export interface MockTestResult {
  attemptId: string;
  reportToken: string;
  totalScore: number;
  maxScore: number;
  percentile: number | null;
  rank: number | null;

  physicsScore: SubjectScore;
  chemistryScore: SubjectScore;
  mathScore: SubjectScore;

  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;

  totalTimeSeconds: number;
  averageTimePerQuestion: number;

  completedAt: Date;
}

export interface SelectionConfig {
  questionsPerSubject: number;
  sectionAQuestions: number; // MCQs
  sectionBQuestions: number; // Numerical
  difficultyDistribution: {
    sectionA: Record<Difficulty, number>;
    sectionB: Record<Difficulty, number>;
  };
  maxQuestionsPerChapter: number;
}

export const DEFAULT_SELECTION_CONFIG: SelectionConfig = {
  questionsPerSubject: 30,
  sectionAQuestions: 20,
  sectionBQuestions: 10,
  difficultyDistribution: {
    sectionA: {
      EASY: 5,
      MEDIUM: 10,
      HARD: 5,
    },
    sectionB: {
      EASY: 2,
      MEDIUM: 5,
      HARD: 3,
    },
  },
  maxQuestionsPerChapter: 2,
};

// Scoring constants
export const SCORING = {
  MCQ_CORRECT: 4,
  MCQ_INCORRECT: -1,
  MCQ_UNANSWERED: 0,
  NUMERICAL_CORRECT: 4,
  NUMERICAL_INCORRECT: 0,
  NUMERICAL_UNANSWERED: 0,
  MAX_SCORE_PER_SUBJECT: 100, // 20 MCQ * 4 + 10 Numerical * 4 = 120, but only 25 are counted
  TOTAL_MAX_SCORE: 300,
} as const;

// Timer constants
export const TIMER = {
  TOTAL_DURATION: 10800, // 3 hours in seconds
  WARNING_30_MIN: 1800,
  WARNING_10_MIN: 600,
  WARNING_5_MIN: 300,
  AUTOSAVE_INTERVAL: 60000, // 60 seconds
} as const;
