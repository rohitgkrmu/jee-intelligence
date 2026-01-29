import { prisma } from "@/lib/db";
import type { Subject, ExamType } from "@prisma/client";

// Type definition for syllabus data structure
interface SyllabusChapter {
  alternateNames?: string[];
  topics?: string[];
  branch?: string;
}

interface SyllabusSubject {
  chapters: Record<string, SyllabusChapter>;
}

interface SyllabusDeletedTopics {
  note: string;
  chemistry: string[];
  physics: string[];
  mathematics: string[];
}

interface SyllabusDataType {
  description: string;
  lastUpdated: string;
  deletedTopics: SyllabusDeletedTopics;
  physics: SyllabusSubject;
  chemistry: SyllabusSubject;
  mathematics: SyllabusSubject;
}

// Import with type assertion
import syllabusDataRaw from "@/../data/syllabus/topic-mapping.json";
const syllabusData = syllabusDataRaw as SyllabusDataType;

// Chapter normalization maps to consolidate similar chapter names
const PHYSICS_CHAPTER_MAP: Record<string, string> = {
  // Mechanics consolidation
  "mechanics": "Mechanics",
  "rotational mechanics": "Mechanics",
  "rotational motion": "Mechanics",
  "system of particles and rotational motion": "Mechanics",
  "circular motion": "Mechanics",
  "kinematics": "Kinematics",
  "motion in a plane": "Kinematics",
  "motion in a straight line": "Kinematics",
  "laws of motion": "Laws of Motion",
  "work, energy and power": "Work, Energy & Power",
  "work energy and power": "Work, Energy & Power",
  // Thermodynamics
  "thermodynamics": "Thermodynamics",
  "thermal physics": "Thermodynamics",
  "thermal properties of matter": "Thermodynamics",
  "heat transfer": "Thermodynamics",
  "kinetic theory": "Kinetic Theory of Gases",
  "kinetic theory of gases": "Kinetic Theory of Gases",
  // Electrostatics & Current
  "electrostatics": "Electrostatics",
  "electric charges and fields": "Electrostatics",
  "electrostatic potential and capacitance": "Electrostatics",
  "current electricity": "Current Electricity",
  // Magnetism
  "magnetism": "Magnetism & Magnetic Effects",
  "magnetic effects of current": "Magnetism & Magnetic Effects",
  "moving charges and magnetism": "Magnetism & Magnetic Effects",
  "magnetism and matter": "Magnetism & Magnetic Effects",
  // EMI & AC
  "electromagnetic induction": "Electromagnetic Induction & AC",
  "alternating current": "Electromagnetic Induction & AC",
  "ac circuits": "Electromagnetic Induction & AC",
  "electromagnetic oscillations": "Electromagnetic Induction & AC",
  // Waves & Oscillations
  "waves": "Waves & Oscillations",
  "oscillations": "Waves & Oscillations",
  "wave motion": "Waves & Oscillations",
  "simple harmonic motion": "Waves & Oscillations",
  "sound waves": "Waves & Oscillations",
  // Optics
  "optics": "Optics",
  "ray optics": "Optics",
  "wave optics": "Optics",
  "ray optics and optical instruments": "Optics",
  // Modern Physics
  "modern physics": "Modern Physics",
  "atoms": "Modern Physics",
  "nuclei": "Modern Physics",
  "atoms and nuclei": "Modern Physics",
  "atomic physics": "Modern Physics",
  "nuclear physics": "Modern Physics",
  "dual nature of radiation and matter": "Modern Physics",
  "dual nature of matter and radiation": "Modern Physics",
  "dual nature of matter": "Modern Physics",
  // Electronics
  "semiconductor electronics": "Semiconductor Electronics",
  "electronic devices": "Semiconductor Electronics",
  "electronics": "Semiconductor Electronics",
  // Properties of Matter
  "properties of matter": "Properties of Matter",
  "mechanical properties of solids": "Properties of Matter",
  "mechanical properties of fluids": "Properties of Matter",
  "mechanical properties of matter": "Properties of Matter",
  "fluid mechanics": "Properties of Matter",
  "surface tension": "Properties of Matter",
  // Electromagnetic Waves
  "electromagnetic waves": "Electromagnetic Waves",
  "electromagnetism": "Electromagnetic Waves",
  // Other
  "units and measurements": "Units & Measurements",
  "measurements": "Units & Measurements",
  "units and dimensions": "Units & Measurements",
  "mathematical tools": "Units & Measurements",
  "gravitation": "Gravitation",
  "communication systems": "Communication Systems",
};

const CHEMISTRY_CHAPTER_MAP: Record<string, string> = {
  // Organic Chemistry - keep as is for now as it's a broad category
  "organic chemistry": "Organic Chemistry",
  "hydrocarbons": "Organic Chemistry",
  // Physical Chemistry
  "physical chemistry": "Physical Chemistry",
  "thermodynamics": "Chemical Thermodynamics",
  "thermochemistry": "Chemical Thermodynamics",
  "chemical kinetics": "Chemical Kinetics",
  "electrochemistry": "Electrochemistry",
  "solutions": "Solutions",
  "solid state": "Solid State",
  "equilibrium": "Chemical Equilibrium",
  "chemical equilibrium": "Chemical Equilibrium",
  "ionic equilibrium": "Chemical Equilibrium",
  "surface chemistry": "Surface Chemistry",
  // Inorganic Chemistry
  "inorganic chemistry": "Inorganic Chemistry",
  "coordination chemistry": "Coordination Compounds",
  "coordination compounds": "Coordination Compounds",
  "p-block elements": "p-Block Elements",
  "d and f block elements": "d & f Block Elements",
  "d-block elements": "d & f Block Elements",
  "s-block elements": "s-Block Elements",
  "alkali and alkaline earth metals": "s-Block Elements",
  "metallurgy": "Metallurgy",
  "qualitative analysis": "Qualitative Analysis",
  // Structure & Bonding
  "atomic structure": "Atomic Structure",
  "structure of atom": "Atomic Structure",
  "chemical bonding": "Chemical Bonding",
  // Periodic Properties
  "periodic properties": "Periodic Table & Properties",
  "periodic table": "Periodic Table & Properties",
  // Applied Chemistry
  "chemistry in everyday life": "Chemistry in Everyday Life",
  "environmental chemistry": "Environmental Chemistry",
  "biomolecules": "Biomolecules",
  "polymers": "Polymers",
  // Other
  "redox reactions": "Redox Reactions",
  "stoichiometry": "Basic Concepts",
  "basic concepts": "Basic Concepts",
  "some basic concepts": "Basic Concepts",
  "general chemistry": "Basic Concepts",
  "general principles": "Basic Concepts",
  "analytical chemistry": "Qualitative Analysis",
  "states of matter": "States of Matter",
  "nuclear chemistry": "Nuclear Chemistry",
  "acids and bases": "Chemical Equilibrium",
  "chemical reactions": "Basic Concepts",
};

const MATHEMATICS_CHAPTER_MAP: Record<string, string> = {
  // Calculus
  "calculus": "Calculus",
  "differential calculus": "Calculus",
  "integral calculus": "Calculus",
  "integration": "Calculus",
  "integrals": "Calculus",
  "limits": "Calculus",
  "limits and continuity": "Calculus",
  "limits and derivatives": "Calculus",
  "continuity and differentiability": "Calculus",
  "applications of integrals": "Calculus",
  "application of derivatives": "Calculus",
  "differential equations": "Differential Equations",
  // Coordinate Geometry
  "coordinate geometry": "Coordinate Geometry",
  "conic sections": "Coordinate Geometry",
  // 3D & Vectors
  "3d geometry": "3D Geometry & Vectors",
  "three dimensional geometry": "3D Geometry & Vectors",
  "vectors": "3D Geometry & Vectors",
  "vector algebra": "3D Geometry & Vectors",
  // Algebra
  "algebra": "Algebra",
  "complex numbers": "Complex Numbers",
  "quadratic equations": "Algebra",
  "theory of equations": "Algebra",
  "sequences and series": "Sequences & Series",
  "binomial theorem": "Binomial Theorem",
  "permutations and combinations": "Permutations & Combinations",
  "combinatorics": "Permutations & Combinations",
  // Matrices
  "matrices": "Matrices & Determinants",
  "determinants": "Matrices & Determinants",
  "matrices and determinants": "Matrices & Determinants",
  "linear algebra": "Matrices & Determinants",
  // Trigonometry
  "trigonometry": "Trigonometry",
  "inverse trigonometric functions": "Trigonometry",
  // Functions & Relations
  "functions": "Functions & Relations",
  "relations and functions": "Functions & Relations",
  "sets and relations": "Functions & Relations",
  "sets": "Functions & Relations",
  "set theory": "Functions & Relations",
  "sets and functions": "Functions & Relations",
  "set theory and relations": "Functions & Relations",
  "functions and limits": "Functions & Relations",
  // Probability & Statistics
  "probability": "Probability & Statistics",
  "statistics": "Probability & Statistics",
  // Other
  "number theory": "Number Theory",
  "mathematical logic": "Mathematical Reasoning",
  "mathematical reasoning": "Mathematical Reasoning",
  "logarithms": "Algebra",
};

function normalizeChapter(chapter: string, subject: string): string {
  const normalized = chapter.toLowerCase().trim();

  if (subject === "PHYSICS") {
    return PHYSICS_CHAPTER_MAP[normalized] || chapter;
  } else if (subject === "CHEMISTRY") {
    return CHEMISTRY_CHAPTER_MAP[normalized] || chapter;
  } else if (subject === "MATHEMATICS") {
    return MATHEMATICS_CHAPTER_MAP[normalized] || chapter;
  }

  return chapter;
}

export type ImportanceLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";

export interface ChapterImportance {
  chapter: string;
  subject: Subject;
  syllabusUnit?: string;
  questionCount: number;
  weightagePercent: number;
  importance: ImportanceLevel;
  trend: "rising" | "falling" | "stable";
  yearlyData: { year: number; count: number }[];
  averageQuestionsPerYear: number;
  lastYearCount: number;
  inSyllabus: boolean;
  relatedTopics: string[];
}

export interface SubjectImportanceData {
  subject: Subject;
  totalQuestions: number;
  chapters: ChapterImportance[];
  criticalChapters: number;
  highChapters: number;
  mediumChapters: number;
  lowChapters: number;
}

export interface SyllabusAnalysisResult {
  examType?: ExamType;
  yearRange: { start: number; end: number };
  totalQuestions: number;
  subjects: SubjectImportanceData[];
  topCriticalChapters: ChapterImportance[];
  deletedTopicsAppearing: string[];
}

function getImportanceLevel(weightagePercent: number, avgQuestionsPerYear: number): ImportanceLevel {
  // Critical: >8% weightage OR >3 questions per year on average
  if (weightagePercent >= 8 || avgQuestionsPerYear >= 3) return "CRITICAL";
  // High: 5-8% weightage OR 2-3 questions per year
  if (weightagePercent >= 5 || avgQuestionsPerYear >= 2) return "HIGH";
  // Medium: 3-5% weightage OR 1-2 questions per year
  if (weightagePercent >= 3 || avgQuestionsPerYear >= 1) return "MEDIUM";
  // Low: 1-3% weightage
  if (weightagePercent >= 1) return "LOW";
  // Minimal: <1%
  return "MINIMAL";
}

function calculateTrend(yearlyData: { year: number; count: number }[]): "rising" | "falling" | "stable" {
  if (yearlyData.length < 2) return "stable";

  // Simple linear regression
  const n = yearlyData.length;
  const years = yearlyData.map(d => d.year);
  const counts = yearlyData.map(d => d.count);

  const sumX = years.reduce((a, b) => a + b, 0);
  const sumY = counts.reduce((a, b) => a + b, 0);
  const sumXY = years.reduce((acc, x, i) => acc + x * counts[i], 0);
  const sumX2 = years.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Threshold for trend determination
  if (slope > 0.3) return "rising";
  if (slope < -0.3) return "falling";
  return "stable";
}

function findChapterInSyllabus(chapter: string, subject: string): { inSyllabus: boolean; relatedTopics: string[] } {
  const subjectKey = subject.toLowerCase() as "physics" | "chemistry" | "mathematics";
  const subjectData = syllabusData[subjectKey];

  if (!subjectData || !subjectData.chapters) {
    return { inSyllabus: false, relatedTopics: [] };
  }

  const chapters = subjectData.chapters;
  const normalizedChapter = chapter.toLowerCase().trim();

  // Check direct match or alternate names
  for (const [syllabusChapter, data] of Object.entries(chapters)) {
    const normalizedSyllabusChapter = syllabusChapter.toLowerCase();
    const alternateNames = (data.alternateNames || []).map(n => n.toLowerCase());

    if (
      normalizedChapter.includes(normalizedSyllabusChapter) ||
      normalizedSyllabusChapter.includes(normalizedChapter) ||
      alternateNames.some(alt =>
        normalizedChapter.includes(alt) || alt.includes(normalizedChapter)
      )
    ) {
      return {
        inSyllabus: true,
        relatedTopics: data.topics || [],
      };
    }
  }

  return { inSyllabus: true, relatedTopics: [] }; // Assume in syllabus if not found (conservative)
}

function isDeletedTopic(chapter: string, subject: string): boolean {
  if (subject !== "CHEMISTRY") return false;

  const deletedTopics = syllabusData.deletedTopics?.chemistry || [];
  const normalizedChapter = chapter.toLowerCase();

  return deletedTopics.some(topic =>
    normalizedChapter.includes(topic.toLowerCase().replace(" (full chapter)", "").replace(" (partially reduced)", ""))
  );
}

export async function analyzeSyllabusWeightage(options?: {
  examType?: ExamType;
  yearStart?: number;
  yearEnd?: number;
}): Promise<SyllabusAnalysisResult> {
  const { examType, yearStart = 2020, yearEnd = 2026 } = options || {};

  const whereClause = {
    isActive: true,
    examYear: {
      gte: yearStart,
      lte: yearEnd,
    },
    ...(examType && { examType }),
  };

  // Get all questions grouped by subject and chapter
  const rawChapterCounts = await prisma.question.groupBy({
    by: ["subject", "chapter"],
    where: whereClause,
    _count: true,
  });

  // Get yearly breakdown for each chapter
  const rawYearlyBreakdown = await prisma.question.groupBy({
    by: ["subject", "chapter", "examYear"],
    where: whereClause,
    _count: true,
  });

  // Normalize and aggregate chapter counts
  const normalizedCounts = new Map<string, { subject: Subject; chapter: string; count: number; originalChapters: string[] }>();

  for (const c of rawChapterCounts) {
    const normalizedChapter = normalizeChapter(c.chapter, c.subject);
    const key = `${c.subject}-${normalizedChapter}`;

    if (normalizedCounts.has(key)) {
      const existing = normalizedCounts.get(key)!;
      existing.count += c._count;
      if (!existing.originalChapters.includes(c.chapter)) {
        existing.originalChapters.push(c.chapter);
      }
    } else {
      normalizedCounts.set(key, {
        subject: c.subject,
        chapter: normalizedChapter,
        count: c._count,
        originalChapters: [c.chapter],
      });
    }
  }

  // Normalize and aggregate yearly breakdown
  const normalizedYearly = new Map<string, Map<number, number>>();

  for (const y of rawYearlyBreakdown) {
    const normalizedChapter = normalizeChapter(y.chapter, y.subject);
    const key = `${y.subject}-${normalizedChapter}`;

    if (!normalizedYearly.has(key)) {
      normalizedYearly.set(key, new Map());
    }
    const yearMap = normalizedYearly.get(key)!;
    yearMap.set(y.examYear, (yearMap.get(y.examYear) || 0) + y._count);
  }

  // Calculate totals
  const chapterCounts = Array.from(normalizedCounts.values());
  const totalQuestions = chapterCounts.reduce((sum, c) => sum + c.count, 0);
  const subjectTotals = new Map<Subject, number>();

  for (const c of chapterCounts) {
    subjectTotals.set(c.subject, (subjectTotals.get(c.subject) || 0) + c.count);
  }

  // Build yearly data
  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);

  // Process each normalized chapter
  const subjectMap = new Map<Subject, ChapterImportance[]>();
  const deletedTopicsAppearing: string[] = [];

  for (const c of chapterCounts) {
    const key = `${c.subject}-${c.chapter}`;
    const yearMap = normalizedYearly.get(key) || new Map();

    // Build yearly data array
    const yearlyData = years.map(year => ({
      year,
      count: yearMap.get(year) || 0,
    }));

    const subjectTotal = subjectTotals.get(c.subject) || 1;
    const weightagePercent = (c.count / subjectTotal) * 100;
    const avgQuestionsPerYear = c.count / years.length;
    const lastYearData = yearlyData.find(d => d.year === yearEnd);

    const { inSyllabus, relatedTopics } = findChapterInSyllabus(c.chapter, c.subject);

    // Check if any original chapter is a deleted topic
    for (const origChapter of c.originalChapters) {
      if (isDeletedTopic(origChapter, c.subject) && c.count > 0) {
        deletedTopicsAppearing.push(origChapter);
      }
    }

    const chapterData: ChapterImportance = {
      chapter: c.chapter,
      subject: c.subject,
      questionCount: c.count,
      weightagePercent,
      importance: getImportanceLevel(weightagePercent, avgQuestionsPerYear),
      trend: calculateTrend(yearlyData),
      yearlyData,
      averageQuestionsPerYear: avgQuestionsPerYear,
      lastYearCount: lastYearData?.count || 0,
      inSyllabus,
      relatedTopics,
    };

    if (!subjectMap.has(c.subject)) {
      subjectMap.set(c.subject, []);
    }
    subjectMap.get(c.subject)!.push(chapterData);
  }

  // Build subject data and sort chapters by importance
  const subjects: SubjectImportanceData[] = [];

  for (const [subject, chapters] of subjectMap) {
    // Sort by weightage descending
    chapters.sort((a, b) => b.weightagePercent - a.weightagePercent);

    const criticalChapters = chapters.filter(c => c.importance === "CRITICAL").length;
    const highChapters = chapters.filter(c => c.importance === "HIGH").length;
    const mediumChapters = chapters.filter(c => c.importance === "MEDIUM").length;
    const lowChapters = chapters.filter(c => c.importance === "LOW" || c.importance === "MINIMAL").length;

    subjects.push({
      subject,
      totalQuestions: subjectTotals.get(subject) || 0,
      chapters,
      criticalChapters,
      highChapters,
      mediumChapters,
      lowChapters,
    });
  }

  // Sort subjects by total questions
  subjects.sort((a, b) => b.totalQuestions - a.totalQuestions);

  // Get top critical chapters across all subjects
  const allChapters = subjects.flatMap(s => s.chapters);
  const topCriticalChapters = allChapters
    .filter(c => c.importance === "CRITICAL" || c.importance === "HIGH")
    .sort((a, b) => b.weightagePercent - a.weightagePercent)
    .slice(0, 15);

  return {
    examType,
    yearRange: { start: yearStart, end: yearEnd },
    totalQuestions,
    subjects,
    topCriticalChapters,
    deletedTopicsAppearing: [...new Set(deletedTopicsAppearing)],
  };
}

export interface ChapterDetail {
  chapter: string;
  subject: Subject;
  importance: ImportanceLevel;
  weightagePercent: number;
  questionCount: number;
  trend: "rising" | "falling" | "stable";
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  topTopics: { topic: string; count: number }[];
  yearlyData: { year: number; count: number }[];
}

export async function getChapterDetail(
  chapter: string,
  subject: Subject,
  options?: { examType?: ExamType; yearStart?: number; yearEnd?: number }
): Promise<ChapterDetail | null> {
  const { examType, yearStart = 2020, yearEnd = 2026 } = options || {};

  const whereClause = {
    isActive: true,
    chapter,
    subject,
    examYear: { gte: yearStart, lte: yearEnd },
    ...(examType && { examType }),
  };

  const questions = await prisma.question.findMany({
    where: whereClause,
    select: {
      topic: true,
      difficulty: true,
      examYear: true,
    },
  });

  if (questions.length === 0) return null;

  // Calculate difficulty distribution
  const difficulty = { easy: 0, medium: 0, hard: 0 };
  for (const q of questions) {
    if (q.difficulty === "EASY") difficulty.easy++;
    else if (q.difficulty === "MEDIUM") difficulty.medium++;
    else if (q.difficulty === "HARD") difficulty.hard++;
  }

  // Get top topics
  const topicCounts = new Map<string, number>();
  for (const q of questions) {
    topicCounts.set(q.topic, (topicCounts.get(q.topic) || 0) + 1);
  }
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  // Get yearly data
  const yearCounts = new Map<number, number>();
  for (const q of questions) {
    yearCounts.set(q.examYear, (yearCounts.get(q.examYear) || 0) + 1);
  }

  const years = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => yearStart + i);
  const yearlyData = years.map(year => ({
    year,
    count: yearCounts.get(year) || 0,
  }));

  // Calculate total for subject to get weightage
  const subjectTotal = await prisma.question.count({
    where: {
      isActive: true,
      subject,
      examYear: { gte: yearStart, lte: yearEnd },
      ...(examType && { examType }),
    },
  });

  const weightagePercent = (questions.length / subjectTotal) * 100;
  const avgQuestionsPerYear = questions.length / years.length;

  return {
    chapter,
    subject,
    importance: getImportanceLevel(weightagePercent, avgQuestionsPerYear),
    weightagePercent,
    questionCount: questions.length,
    trend: calculateTrend(yearlyData),
    difficulty,
    topTopics,
    yearlyData,
  };
}
