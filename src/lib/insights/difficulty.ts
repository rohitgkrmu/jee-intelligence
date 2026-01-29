import prisma from "@/lib/db";

interface DifficultyStats {
  chapter: string;
  subject: string;
  totalQuestions: number;
  easy: number;
  medium: number;
  hard: number;
  averageDifficulty: number;
  hardRatio: number;
}

interface SubjectDifficultyProfile {
  subject: string;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  totalQuestions: number;
  hardestChapters: { chapter: string; hardRatio: number }[];
  easiestChapters: { chapter: string; easyRatio: number }[];
}

export async function getDifficultyAnalysis(yearStart = 2020, yearEnd = 2025) {
  // Get questions with difficulty data
  const questions = await prisma.question.findMany({
    where: {
      examYear: { gte: yearStart, lte: yearEnd },
    },
    select: {
      subject: true,
      chapter: true,
      difficulty: true,
    },
  });

  // Filter out questions without difficulty
  const questionsWithDifficulty = questions.filter(q => q.difficulty !== null);

  // Calculate chapter-wise difficulty stats
  const chapterStats = new Map<string, DifficultyStats>();

  questionsWithDifficulty.forEach((q) => {
    if (!q.chapter || !q.difficulty) return;

    const key = `${q.subject}:${q.chapter}`;
    const existing = chapterStats.get(key) || {
      chapter: q.chapter,
      subject: q.subject,
      totalQuestions: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      averageDifficulty: 0,
      hardRatio: 0,
    };

    existing.totalQuestions++;
    if (q.difficulty === "EASY") existing.easy++;
    else if (q.difficulty === "MEDIUM") existing.medium++;
    else if (q.difficulty === "HARD") existing.hard++;

    chapterStats.set(key, existing);
  });

  // Calculate averages and ratios
  const chapterDifficulty: DifficultyStats[] = [];
  chapterStats.forEach((stats) => {
    const diffSum = stats.easy * 1 + stats.medium * 2 + stats.hard * 3;
    stats.averageDifficulty = diffSum / stats.totalQuestions;
    stats.hardRatio = stats.hard / stats.totalQuestions;
    if (stats.totalQuestions >= 3) {
      chapterDifficulty.push(stats);
    }
  });

  // Sort by hard ratio
  chapterDifficulty.sort((a, b) => b.hardRatio - a.hardRatio);

  // Calculate subject profiles
  const subjectProfiles: SubjectDifficultyProfile[] = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"].map(
    (subject) => {
      const subjectChapters = chapterDifficulty.filter((c) => c.subject === subject);
      const total = subjectChapters.reduce((sum, c) => sum + c.totalQuestions, 0);
      const easy = subjectChapters.reduce((sum, c) => sum + c.easy, 0);
      const medium = subjectChapters.reduce((sum, c) => sum + c.medium, 0);
      const hard = subjectChapters.reduce((sum, c) => sum + c.hard, 0);

      return {
        subject,
        easyPercentage: total > 0 ? (easy / total) * 100 : 0,
        mediumPercentage: total > 0 ? (medium / total) * 100 : 0,
        hardPercentage: total > 0 ? (hard / total) * 100 : 0,
        totalQuestions: total,
        hardestChapters: subjectChapters
          .filter((c) => c.hardRatio > 0.3)
          .sort((a, b) => b.hardRatio - a.hardRatio)
          .slice(0, 5)
          .map((c) => ({ chapter: c.chapter, hardRatio: c.hardRatio })),
        easiestChapters: subjectChapters
          .sort((a, b) => b.easy / b.totalQuestions - a.easy / a.totalQuestions)
          .slice(0, 5)
          .map((c) => ({
            chapter: c.chapter,
            easyRatio: c.easy / c.totalQuestions,
          })),
      };
    }
  );

  return {
    chapterDifficulty: chapterDifficulty.slice(0, 20),
    subjectProfiles,
    overallStats: {
      totalQuestions: questionsWithDifficulty.length,
      easyCount: questionsWithDifficulty.filter((q) => q.difficulty === "EASY").length,
      mediumCount: questionsWithDifficulty.filter((q) => q.difficulty === "MEDIUM").length,
      hardCount: questionsWithDifficulty.filter((q) => q.difficulty === "HARD").length,
    },
  };
}
