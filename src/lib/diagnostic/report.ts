import { prisma } from "@/lib/db";
import type { DiagnosticAttempt, Subject, DiagnosticItem } from "@prisma/client";

export interface AnswerRecord {
  answer: string;
  isCorrect: boolean;
  timeSeconds?: number;
}

export interface SubjectScore {
  subject: Subject;
  correct: number;
  total: number;
  percentage: number;
}

export interface ConceptResult {
  concept: string;
  chapter: string;
  subject: Subject;
  isCorrect: boolean;
}

export interface ReportData {
  attemptId: string;
  reportToken: string;
  leadName: string;
  leadEmail: string;
  completedAt: Date;

  // Scores
  readinessScore: number;
  readinessLabel: string;
  totalCorrect: number;
  totalQuestions: number;

  // Subject breakdown
  subjectScores: SubjectScore[];

  // Concept analysis
  strengthConcepts: string[];
  weaknessConcepts: string[];

  // Study recommendations
  studyPlan: StudyPlanItem[];
  nextSteps: string[];
}

export interface StudyPlanItem {
  day: number;
  concept: string;
  chapter: string;
  subject: Subject;
  priority: "high" | "medium";
  reason: string;
}

export function getReadinessLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Needs Improvement";
  return "Foundation Required";
}

export async function generateReport(attemptId: string): Promise<ReportData | null> {
  const attempt = await prisma.diagnosticAttempt.findUnique({
    where: { id: attemptId },
    include: {
      lead: true,
    },
  });

  if (!attempt || attempt.status !== "COMPLETED") {
    return null;
  }

  // Get diagnostic items
  const items = await prisma.diagnosticItem.findMany({
    where: { id: { in: attempt.selectedItems } },
  });

  const itemMap = new Map(items.map((item) => [item.id, item]));
  const answers = (attempt.answers as unknown as Record<string, AnswerRecord>) || {};

  // Calculate scores
  const subjectStats: Record<Subject, { correct: number; total: number }> = {
    PHYSICS: { correct: 0, total: 0 },
    CHEMISTRY: { correct: 0, total: 0 },
    MATHEMATICS: { correct: 0, total: 0 },
  };

  const conceptResults: ConceptResult[] = [];
  const correctConcepts: Set<string> = new Set();
  const incorrectConcepts: Set<string> = new Set();

  for (const itemId of attempt.selectedItems) {
    const item = itemMap.get(itemId);
    if (!item) continue;

    const answer = answers[itemId];
    const isCorrect = answer?.isCorrect || false;

    subjectStats[item.subject].total++;
    if (isCorrect) {
      subjectStats[item.subject].correct++;
      correctConcepts.add(item.concept);
    } else {
      incorrectConcepts.add(item.concept);
    }

    conceptResults.push({
      concept: item.concept,
      chapter: item.chapter,
      subject: item.subject,
      isCorrect,
    });
  }

  // Calculate subject scores
  const subjectScores: SubjectScore[] = Object.entries(subjectStats).map(
    ([subject, stats]) => ({
      subject: subject as Subject,
      correct: stats.correct,
      total: stats.total,
      percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    })
  );

  // Calculate overall score
  const totalCorrect = Object.values(subjectStats).reduce(
    (sum, s) => sum + s.correct,
    0
  );
  const totalQuestions = Object.values(subjectStats).reduce(
    (sum, s) => sum + s.total,
    0
  );
  const readinessScore =
    totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  // Determine strengths (correct) and weaknesses (incorrect)
  const strengthConcepts = Array.from(correctConcepts);
  const weaknessConcepts = Array.from(incorrectConcepts).filter(
    (c) => !correctConcepts.has(c)
  );

  // Generate study plan (14-day prioritized)
  const studyPlan = generateStudyPlan(conceptResults, items);

  // Generate next steps
  const nextSteps = generateNextSteps(readinessScore, subjectScores);

  // Update attempt with calculated scores
  await prisma.diagnosticAttempt.update({
    where: { id: attemptId },
    data: {
      readinessScore,
      physicsScore: subjectStats.PHYSICS.total > 0
        ? (subjectStats.PHYSICS.correct / subjectStats.PHYSICS.total) * 100
        : null,
      chemistryScore: subjectStats.CHEMISTRY.total > 0
        ? (subjectStats.CHEMISTRY.correct / subjectStats.CHEMISTRY.total) * 100
        : null,
      mathScore: subjectStats.MATHEMATICS.total > 0
        ? (subjectStats.MATHEMATICS.correct / subjectStats.MATHEMATICS.total) * 100
        : null,
      strengthConcepts,
      weaknessConcepts,
    },
  });

  return {
    attemptId: attempt.id,
    reportToken: attempt.reportToken,
    leadName: attempt.lead.name,
    leadEmail: attempt.lead.email,
    completedAt: attempt.completedAt || new Date(),
    readinessScore: Math.round(readinessScore),
    readinessLabel: getReadinessLabel(readinessScore),
    totalCorrect,
    totalQuestions,
    subjectScores,
    strengthConcepts,
    weaknessConcepts,
    studyPlan,
    nextSteps,
  };
}

function generateStudyPlan(
  results: ConceptResult[],
  items: DiagnosticItem[]
): StudyPlanItem[] {
  // Focus on incorrect concepts, sorted by priority
  const incorrectResults = results.filter((r) => !r.isCorrect);
  const itemMap = new Map(items.map((i) => [i.concept, i]));

  const plan: StudyPlanItem[] = [];
  let day = 1;

  // High priority: Incorrect concepts from high-frequency items
  const highPriority = incorrectResults
    .filter((r) => {
      const item = itemMap.get(r.concept);
      return item && item.priorityScore >= 1.5;
    })
    .slice(0, 7);

  for (const result of highPriority) {
    plan.push({
      day: day++,
      concept: result.concept,
      chapter: result.chapter,
      subject: result.subject,
      priority: "high",
      reason: "High frequency in JEE exams",
    });
  }

  // Medium priority: Other incorrect concepts
  const mediumPriority = incorrectResults
    .filter((r) => !highPriority.includes(r))
    .slice(0, 14 - plan.length);

  for (const result of mediumPriority) {
    plan.push({
      day: day++,
      concept: result.concept,
      chapter: result.chapter,
      subject: result.subject,
      priority: "medium",
      reason: "Important for conceptual clarity",
    });
  }

  return plan;
}

function generateNextSteps(
  readinessScore: number,
  subjectScores: SubjectScore[]
): string[] {
  const steps: string[] = [];

  // Overall readiness advice
  if (readinessScore >= 80) {
    steps.push(
      "Excellent foundation! Focus on advanced problems and time management."
    );
  } else if (readinessScore >= 60) {
    steps.push(
      "Good progress! Strengthen weak areas with focused practice sessions."
    );
  } else if (readinessScore >= 40) {
    steps.push(
      "Review fundamental concepts before moving to complex problems."
    );
  } else {
    steps.push(
      "Start with NCERT and build strong conceptual foundation first."
    );
  }

  // Subject-specific advice
  const weakestSubject = subjectScores.reduce((min, s) =>
    s.percentage < min.percentage ? s : min
  );

  if (weakestSubject.percentage < 50) {
    const subjectName =
      weakestSubject.subject === "MATHEMATICS"
        ? "Mathematics"
        : weakestSubject.subject === "PHYSICS"
        ? "Physics"
        : "Chemistry";
    steps.push(
      `Prioritize ${subjectName} - consider dedicated coaching or extra practice.`
    );
  }

  // Generic advice
  steps.push("Practice with previous year JEE questions daily.");
  steps.push("Take regular mock tests to track improvement.");
  steps.push("Join Zenith's personalized learning program for structured guidance.");

  return steps.slice(0, 5);
}

export async function getReportByToken(token: string): Promise<ReportData | null> {
  const attempt = await prisma.diagnosticAttempt.findUnique({
    where: { reportToken: token },
    include: { lead: true },
  });

  if (!attempt) {
    return null;
  }

  if (attempt.status !== "COMPLETED") {
    return null;
  }

  // If report data already exists, use it
  if (attempt.readinessScore !== null) {
    const items = await prisma.diagnosticItem.findMany({
      where: { id: { in: attempt.selectedItems } },
    });

    const subjectScores: SubjectScore[] = [
      {
        subject: "PHYSICS",
        correct: 0,
        total: 0,
        percentage: attempt.physicsScore || 0,
      },
      {
        subject: "CHEMISTRY",
        correct: 0,
        total: 0,
        percentage: attempt.chemistryScore || 0,
      },
      {
        subject: "MATHEMATICS",
        correct: 0,
        total: 0,
        percentage: attempt.mathScore || 0,
      },
    ];

    const answers = (attempt.answers as unknown as Record<string, AnswerRecord>) || {};
    const conceptResults: ConceptResult[] = [];

    for (const item of items) {
      const answer = answers[item.id];
      conceptResults.push({
        concept: item.concept,
        chapter: item.chapter,
        subject: item.subject,
        isCorrect: answer?.isCorrect || false,
      });

      const subjectScore = subjectScores.find((s) => s.subject === item.subject);
      if (subjectScore) {
        subjectScore.total++;
        if (answer?.isCorrect) subjectScore.correct++;
      }
    }

    return {
      attemptId: attempt.id,
      reportToken: attempt.reportToken,
      leadName: attempt.lead.name,
      leadEmail: attempt.lead.email,
      completedAt: attempt.completedAt || new Date(),
      readinessScore: Math.round(attempt.readinessScore),
      readinessLabel: getReadinessLabel(attempt.readinessScore),
      totalCorrect: attempt.correctCount,
      totalQuestions: attempt.correctCount + attempt.incorrectCount + attempt.skippedCount,
      subjectScores,
      strengthConcepts: attempt.strengthConcepts,
      weaknessConcepts: attempt.weaknessConcepts,
      studyPlan: generateStudyPlan(conceptResults, items),
      nextSteps: generateNextSteps(attempt.readinessScore, subjectScores),
    };
  }

  // Generate report if not already generated
  return generateReport(attempt.id);
}
