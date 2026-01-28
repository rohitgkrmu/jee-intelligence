import { prisma } from "@/lib/db";
import type { Subject, ExamType } from "@prisma/client";

export interface YearlyCount {
  year: number;
  count: number;
}

export interface ConceptTrend {
  concept: string;
  chapter: string;
  subject: Subject;
  totalCount: number;
  yearlyCounts: YearlyCount[];
  trend: "rising" | "falling" | "stable";
  slope: number;
}

function calculateLinearRegression(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;

  const n = points.length;
  const sumX = points.reduce((acc, p) => acc + p.x, 0);
  const sumY = points.reduce((acc, p) => acc + p.y, 0);
  const sumXY = points.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumXX = points.reduce((acc, p) => acc + p.x * p.x, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  return (n * sumXY - sumX * sumY) / denominator;
}

function getTrendLabel(slope: number): "rising" | "falling" | "stable" {
  if (slope > 0.3) return "rising";
  if (slope < -0.3) return "falling";
  return "stable";
}

export async function analyzeConceptTrends(options?: {
  examType?: ExamType;
  subject?: Subject;
  yearStart?: number;
  yearEnd?: number;
  minOccurrences?: number;
}): Promise<ConceptTrend[]> {
  const {
    examType,
    subject,
    yearStart = 2020,
    yearEnd = 2024,
    minOccurrences = 3,
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

  // Get yearly counts per concept
  const yearlyCounts = await prisma.question.groupBy({
    by: ["concept", "chapter", "subject", "examYear"],
    where: whereClause,
    _count: true,
  });

  // Group by concept
  const conceptMap = new Map<
    string,
    {
      concept: string;
      chapter: string;
      subject: Subject;
      yearlyCounts: Map<number, number>;
    }
  >();

  for (const item of yearlyCounts) {
    const key = `${item.subject}:${item.chapter}:${item.concept}`;

    if (!conceptMap.has(key)) {
      conceptMap.set(key, {
        concept: item.concept,
        chapter: item.chapter,
        subject: item.subject,
        yearlyCounts: new Map(),
      });
    }

    conceptMap.get(key)!.yearlyCounts.set(item.examYear, item._count);
  }

  // Calculate trends
  const trends: ConceptTrend[] = [];

  for (const data of conceptMap.values()) {
    const totalCount = Array.from(data.yearlyCounts.values()).reduce(
      (a, b) => a + b,
      0
    );

    if (totalCount < minOccurrences) continue;

    // Build yearly counts array
    const yearlyCountsArray: YearlyCount[] = [];
    for (let year = yearStart; year <= yearEnd; year++) {
      yearlyCountsArray.push({
        year,
        count: data.yearlyCounts.get(year) || 0,
      });
    }

    // Calculate slope
    const points = yearlyCountsArray.map((yc) => ({
      x: yc.year - yearStart, // Normalize years
      y: yc.count,
    }));
    const slope = calculateLinearRegression(points);

    trends.push({
      concept: data.concept,
      chapter: data.chapter,
      subject: data.subject,
      totalCount,
      yearlyCounts: yearlyCountsArray,
      trend: getTrendLabel(slope),
      slope,
    });
  }

  // Sort by absolute slope (most dramatic trends first)
  trends.sort((a, b) => Math.abs(b.slope) - Math.abs(a.slope));

  return trends;
}

export async function getRisingConcepts(options?: {
  examType?: ExamType;
  subject?: Subject;
  limit?: number;
}): Promise<ConceptTrend[]> {
  const { examType, subject, limit = 10 } = options || {};

  const trends = await analyzeConceptTrends({
    examType,
    subject,
  });

  return trends.filter((t) => t.trend === "rising").slice(0, limit);
}

export async function getFallingConcepts(options?: {
  examType?: ExamType;
  subject?: Subject;
  limit?: number;
}): Promise<ConceptTrend[]> {
  const { examType, subject, limit = 10 } = options || {};

  const trends = await analyzeConceptTrends({
    examType,
    subject,
  });

  return trends.filter((t) => t.trend === "falling").slice(0, limit);
}

export interface SubjectTrend {
  subject: Subject;
  yearlyCounts: YearlyCount[];
  averagePerYear: number;
}

export async function getSubjectTrends(options?: {
  examType?: ExamType;
  yearStart?: number;
  yearEnd?: number;
}): Promise<SubjectTrend[]> {
  const { examType, yearStart = 2020, yearEnd = 2024 } = options || {};

  const whereClause = {
    isActive: true,
    examYear: {
      gte: yearStart,
      lte: yearEnd,
    },
    ...(examType && { examType }),
  };

  const yearlyCounts = await prisma.question.groupBy({
    by: ["subject", "examYear"],
    where: whereClause,
    _count: true,
  });

  // Group by subject
  const subjectMap = new Map<Subject, Map<number, number>>();

  for (const item of yearlyCounts) {
    if (!subjectMap.has(item.subject)) {
      subjectMap.set(item.subject, new Map());
    }
    subjectMap.get(item.subject)!.set(item.examYear, item._count);
  }

  const trends: SubjectTrend[] = [];

  for (const [subject, yearCounts] of subjectMap) {
    const yearlyCountsArray: YearlyCount[] = [];
    let total = 0;

    for (let year = yearStart; year <= yearEnd; year++) {
      const count = yearCounts.get(year) || 0;
      yearlyCountsArray.push({ year, count });
      total += count;
    }

    trends.push({
      subject,
      yearlyCounts: yearlyCountsArray,
      averagePerYear: total / (yearEnd - yearStart + 1),
    });
  }

  return trends;
}
