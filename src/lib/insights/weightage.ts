import { prisma } from "@/lib/db";
import type { Subject, ExamType } from "@prisma/client";

export interface ChapterWeightage {
  chapter: string;
  count: number;
  percentage: number;
}

export interface SubjectWeightage {
  subject: Subject;
  totalQuestions: number;
  percentage: number;
  chapters: ChapterWeightage[];
}

export interface WeightageData {
  totalQuestions: number;
  examType?: ExamType;
  yearRange: { start: number; end: number };
  subjects: SubjectWeightage[];
}

export async function calculateWeightage(options?: {
  examType?: ExamType;
  yearStart?: number;
  yearEnd?: number;
}): Promise<WeightageData> {
  const { examType, yearStart = 2020, yearEnd = 2024 } = options || {};

  const whereClause = {
    isActive: true,
    examYear: {
      gte: yearStart,
      lte: yearEnd,
    },
    ...(examType && { examType }),
  };

  // Get total questions
  const totalQuestions = await prisma.question.count({
    where: whereClause,
  });

  // Group by subject
  const subjectCounts = await prisma.question.groupBy({
    by: ["subject"],
    where: whereClause,
    _count: true,
  });

  // Group by subject and chapter
  const chapterCounts = await prisma.question.groupBy({
    by: ["subject", "chapter"],
    where: whereClause,
    _count: true,
    orderBy: {
      _count: {
        chapter: "desc",
      },
    },
  });

  // Build the response
  const subjectMap = new Map<Subject, SubjectWeightage>();

  // Initialize subjects
  for (const sc of subjectCounts) {
    subjectMap.set(sc.subject, {
      subject: sc.subject,
      totalQuestions: sc._count,
      percentage: totalQuestions > 0 ? (sc._count / totalQuestions) * 100 : 0,
      chapters: [],
    });
  }

  // Add chapters
  for (const cc of chapterCounts) {
    const subjectData = subjectMap.get(cc.subject);
    if (subjectData) {
      subjectData.chapters.push({
        chapter: cc.chapter,
        count: cc._count,
        percentage: subjectData.totalQuestions > 0 ? (cc._count / subjectData.totalQuestions) * 100 : 0,
      });
    }
  }

  return {
    totalQuestions,
    examType,
    yearRange: { start: yearStart, end: yearEnd },
    subjects: Array.from(subjectMap.values()).sort(
      (a, b) => b.totalQuestions - a.totalQuestions
    ),
  };
}

export interface ConceptWeightage {
  concept: string;
  chapter: string;
  subject: Subject;
  count: number;
  percentage: number;
}

export async function getTopConcepts(options?: {
  examType?: ExamType;
  subject?: Subject;
  yearStart?: number;
  yearEnd?: number;
  limit?: number;
}): Promise<ConceptWeightage[]> {
  const {
    examType,
    subject,
    yearStart = 2020,
    yearEnd = 2024,
    limit = 20,
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

  const totalQuestions = await prisma.question.count({
    where: whereClause,
  });

  const conceptCounts = await prisma.question.groupBy({
    by: ["concept", "chapter", "subject"],
    where: whereClause,
    _count: true,
    orderBy: {
      _count: {
        concept: "desc",
      },
    },
    take: limit,
  });

  return conceptCounts.map((cc) => ({
    concept: cc.concept,
    chapter: cc.chapter,
    subject: cc.subject,
    count: cc._count,
    percentage: totalQuestions > 0 ? (cc._count / totalQuestions) * 100 : 0,
  }));
}
