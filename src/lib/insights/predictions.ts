import prisma from "@/lib/db";

interface PredictedTopic {
  topic: string;
  chapter: string;
  subject: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  historicalFrequency: number;
  lastAppeared: number;
  gapYears: number;
}

interface ChapterPrediction {
  chapter: string;
  subject: string;
  expectedQuestions: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  hotTopics: string[];
}

export async function getNextExamPredictions() {
  const currentYear = new Date().getFullYear();

  // Get all questions from recent years
  const questions = await prisma.question.findMany({
    where: {
      examYear: { gte: 2020, lte: currentYear },
    },
    select: {
      examYear: true,
      subject: true,
      chapter: true,
      topic: true,
      concept: true,
      difficulty: true,
    },
  });

  // Analyze topic frequency and gaps
  const topicHistory = new Map<string, { years: number[]; count: number; subject: string; chapter: string }>();

  questions.forEach((q) => {
    if (!q.topic) return;
    const key = `${q.subject}:${q.chapter}:${q.topic}`;
    const existing = topicHistory.get(key) || {
      years: [],
      count: 0,
      subject: q.subject,
      chapter: q.chapter || "Unknown",
    };
    if (!existing.years.includes(q.examYear)) {
      existing.years.push(q.examYear);
    }
    existing.count++;
    topicHistory.set(key, existing);
  });

  // Find topics likely to appear (high frequency historically but gap recently)
  const predictions: PredictedTopic[] = [];

  topicHistory.forEach((data, key) => {
    const topic = key.split(":")[2];
    const lastYear = Math.max(...data.years);
    const gapYears = currentYear - lastYear;

    // Topics that appear frequently but haven't appeared recently
    if (data.count >= 3 && gapYears >= 1) {
      predictions.push({
        topic,
        chapter: data.chapter,
        subject: data.subject,
        confidence: gapYears >= 2 && data.count >= 5 ? "high" : gapYears >= 1 && data.count >= 3 ? "medium" : "low",
        reason: `Appeared ${data.count} times historically, last seen in ${lastYear}`,
        historicalFrequency: data.count,
        lastAppeared: lastYear,
        gapYears,
      });
    }
  });

  // Sort by likelihood (gap * frequency)
  predictions.sort((a, b) => (b.gapYears * b.historicalFrequency) - (a.gapYears * a.historicalFrequency));

  // Calculate chapter predictions
  const chapterCounts = new Map<string, { years: Map<number, number>; subject: string; topics: Set<string> }>();

  questions.forEach((q) => {
    if (!q.chapter) return;
    const key = `${q.subject}:${q.chapter}`;
    const existing = chapterCounts.get(key) || {
      years: new Map(),
      subject: q.subject,
      topics: new Set(),
    };
    existing.years.set(q.examYear, (existing.years.get(q.examYear) || 0) + 1);
    if (q.topic) existing.topics.add(q.topic);
    chapterCounts.set(key, existing);
  });

  const chapterPredictions: ChapterPrediction[] = [];

  chapterCounts.forEach((data, key) => {
    const chapter = key.split(":")[1];
    const yearCounts = Array.from(data.years.entries()).sort((a, b) => a[0] - b[0]);

    if (yearCounts.length < 2) return;

    // Calculate trend
    const recentYears = yearCounts.slice(-3);
    const avgRecent = recentYears.reduce((sum, [, count]) => sum + count, 0) / recentYears.length;
    const avgOverall = yearCounts.reduce((sum, [, count]) => sum + count, 0) / yearCounts.length;

    const trend = avgRecent > avgOverall * 1.2 ? "increasing" : avgRecent < avgOverall * 0.8 ? "decreasing" : "stable";

    chapterPredictions.push({
      chapter,
      subject: data.subject,
      expectedQuestions: Math.round(avgRecent),
      confidence: yearCounts.length >= 4 ? 0.8 : 0.5,
      trend,
      hotTopics: Array.from(data.topics).slice(0, 5),
    });
  });

  // Sort by expected questions
  chapterPredictions.sort((a, b) => b.expectedQuestions - a.expectedQuestions);

  return {
    topicPredictions: predictions.slice(0, 20),
    chapterPredictions: chapterPredictions.slice(0, 15),
    insights: {
      highConfidencePredictions: predictions.filter((p) => p.confidence === "high").length,
      totalAnalyzedTopics: topicHistory.size,
      yearsCovered: [...new Set(questions.map((q) => q.examYear))].sort(),
    },
  };
}
