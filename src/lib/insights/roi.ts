import { prisma } from "@/lib/db";
import type { Subject, ExamType, Difficulty } from "@prisma/client";

export interface ROIConcept {
  concept: string;
  chapter: string;
  subject: Subject;
  frequency: number; // Number of times asked
  avgDifficulty: number; // 1-3 scale
  roiScore: number; // frequency × avgDifficulty factor
  recommendation: "high" | "medium" | "low";
}

const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
  EASY: 1,
  MEDIUM: 2,
  HARD: 3,
};

function getDifficultyWeight(difficulty: Difficulty): number {
  return DIFFICULTY_WEIGHTS[difficulty] || 2;
}

function getRecommendation(roiScore: number): "high" | "medium" | "low" {
  if (roiScore >= 5) return "high";
  if (roiScore >= 2) return "medium";
  return "low";
}

export async function calculateROI(options?: {
  examType?: ExamType;
  subject?: Subject;
  yearStart?: number;
  yearEnd?: number;
  limit?: number;
}): Promise<ROIConcept[]> {
  const {
    examType,
    subject,
    yearStart = 2020,
    yearEnd = 2024,
    limit = 30,
  } = options || {};

  const whereClause = {
    isActive: true,
    examYear: {
      gte: yearStart,
      lte: yearEnd,
    },
    ...(examType && { examType }),
    ...(subject && { subject }),
  };

  // Get questions grouped by concept with difficulty
  const questions = await prisma.question.findMany({
    where: whereClause,
    select: {
      concept: true,
      chapter: true,
      subject: true,
      difficulty: true,
    },
  });

  // Aggregate by concept
  const conceptMap = new Map<
    string,
    {
      concept: string;
      chapter: string;
      subject: Subject;
      count: number;
      difficultySum: number;
    }
  >();

  for (const q of questions) {
    const key = `${q.subject}:${q.chapter}:${q.concept}`;

    if (!conceptMap.has(key)) {
      conceptMap.set(key, {
        concept: q.concept,
        chapter: q.chapter,
        subject: q.subject,
        count: 0,
        difficultySum: 0,
      });
    }

    const data = conceptMap.get(key)!;
    data.count++;
    data.difficultySum += getDifficultyWeight(q.difficulty);
  }

  // Calculate ROI scores
  const roiConcepts: ROIConcept[] = [];

  for (const data of conceptMap.values()) {
    const avgDifficulty = data.difficultySum / data.count;
    // ROI formula: frequency × (difficulty factor / 3)
    // This favors high-frequency concepts that aren't too hard
    const roiScore = data.count * (avgDifficulty / 3);

    roiConcepts.push({
      concept: data.concept,
      chapter: data.chapter,
      subject: data.subject,
      frequency: data.count,
      avgDifficulty,
      roiScore,
      recommendation: getRecommendation(roiScore),
    });
  }

  // Sort by ROI score descending
  roiConcepts.sort((a, b) => b.roiScore - a.roiScore);

  return roiConcepts.slice(0, limit);
}

export interface ChapterROI {
  chapter: string;
  subject: Subject;
  totalQuestions: number;
  avgDifficulty: number;
  roiScore: number;
  topConcepts: string[];
}

export async function calculateChapterROI(options?: {
  examType?: ExamType;
  subject?: Subject;
  yearStart?: number;
  yearEnd?: number;
}): Promise<ChapterROI[]> {
  const { examType, subject, yearStart = 2020, yearEnd = 2024 } = options || {};

  const whereClause = {
    isActive: true,
    examYear: {
      gte: yearStart,
      lte: yearEnd,
    },
    ...(examType && { examType }),
    ...(subject && { subject }),
  };

  // Get questions
  const questions = await prisma.question.findMany({
    where: whereClause,
    select: {
      chapter: true,
      subject: true,
      concept: true,
      difficulty: true,
    },
  });

  // Aggregate by chapter
  const chapterMap = new Map<
    string,
    {
      chapter: string;
      subject: Subject;
      count: number;
      difficultySum: number;
      concepts: Map<string, number>;
    }
  >();

  for (const q of questions) {
    const key = `${q.subject}:${q.chapter}`;

    if (!chapterMap.has(key)) {
      chapterMap.set(key, {
        chapter: q.chapter,
        subject: q.subject,
        count: 0,
        difficultySum: 0,
        concepts: new Map(),
      });
    }

    const data = chapterMap.get(key)!;
    data.count++;
    data.difficultySum += getDifficultyWeight(q.difficulty);
    data.concepts.set(q.concept, (data.concepts.get(q.concept) || 0) + 1);
  }

  // Calculate ROI
  const chapterROIs: ChapterROI[] = [];

  for (const data of chapterMap.values()) {
    const avgDifficulty = data.difficultySum / data.count;
    const roiScore = data.count * (avgDifficulty / 3);

    // Get top 3 concepts
    const sortedConcepts = Array.from(data.concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([concept]) => concept);

    chapterROIs.push({
      chapter: data.chapter,
      subject: data.subject,
      totalQuestions: data.count,
      avgDifficulty,
      roiScore,
      topConcepts: sortedConcepts,
    });
  }

  // Sort by ROI score descending
  chapterROIs.sort((a, b) => b.roiScore - a.roiScore);

  return chapterROIs;
}

export interface StudyPriority {
  rank: number;
  concept: string;
  chapter: string;
  subject: Subject;
  reason: string;
  estimatedQuestions: number;
}

export async function generateStudyPriorities(options?: {
  examType?: ExamType;
  targetYear?: number;
  limit?: number;
}): Promise<StudyPriority[]> {
  const { examType, targetYear = new Date().getFullYear() + 1, limit = 20 } =
    options || {};

  const roiConcepts = await calculateROI({
    examType,
    yearStart: targetYear - 5,
    yearEnd: targetYear - 1,
    limit: limit * 2,
  });

  const priorities: StudyPriority[] = roiConcepts
    .filter((c) => c.recommendation !== "low")
    .slice(0, limit)
    .map((c, index) => ({
      rank: index + 1,
      concept: c.concept,
      chapter: c.chapter,
      subject: c.subject,
      reason:
        c.recommendation === "high"
          ? "High frequency in recent exams"
          : "Moderate frequency with good scoring potential",
      estimatedQuestions: Math.round(c.frequency / 5), // Rough estimate per year
    }));

  return priorities;
}
