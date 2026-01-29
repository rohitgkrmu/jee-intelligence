import { NextResponse } from "next/server";
import { analyzeSyllabusWeightage } from "@/lib/insights/syllabus-analysis";

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Fetch data for both exam types in parallel
    const [mainData, advancedData] = await Promise.all([
      analyzeSyllabusWeightage({ examType: "MAIN", yearStart: 2020, yearEnd: 2026 }),
      analyzeSyllabusWeightage({ examType: "ADVANCED", yearStart: 2019, yearEnd: 2025 }),
    ]);

    // Build comparison data
    const comparison = {
      main: {
        totalQuestions: mainData.totalQuestions,
        yearRange: mainData.yearRange,
        subjects: mainData.subjects.map(s => ({
          subject: s.subject,
          totalQuestions: s.totalQuestions,
          criticalChapters: s.criticalChapters,
          highChapters: s.highChapters,
          topChapters: s.chapters.slice(0, 5).map(c => ({
            chapter: c.chapter,
            weightagePercent: c.weightagePercent,
            importance: c.importance,
          })),
        })),
      },
      advanced: {
        totalQuestions: advancedData.totalQuestions,
        yearRange: advancedData.yearRange,
        subjects: advancedData.subjects.map(s => ({
          subject: s.subject,
          totalQuestions: s.totalQuestions,
          criticalChapters: s.criticalChapters,
          highChapters: s.highChapters,
          topChapters: s.chapters.slice(0, 5).map(c => ({
            chapter: c.chapter,
            weightagePercent: c.weightagePercent,
            importance: c.importance,
          })),
        })),
      },
      // Chapter-by-chapter comparison
      chapterComparison: buildChapterComparison(mainData, advancedData),
      // Key insights
      insights: generateInsights(mainData, advancedData),
    };

    return NextResponse.json(comparison);
  } catch (error) {
    console.error("Error generating exam comparison:", error);
    return NextResponse.json(
      { error: "Failed to generate exam comparison" },
      { status: 500 }
    );
  }
}

interface ChapterData {
  chapter: string;
  subject: string;
  mainWeightage: number;
  advancedWeightage: number;
  mainImportance: string;
  advancedImportance: string;
  difference: number; // positive = more important in Advanced
  mainOnly: boolean;
  advancedOnly: boolean;
}

function buildChapterComparison(
  mainData: Awaited<ReturnType<typeof analyzeSyllabusWeightage>>,
  advancedData: Awaited<ReturnType<typeof analyzeSyllabusWeightage>>
): ChapterData[] {
  const chapterMap = new Map<string, ChapterData>();

  // Add all Main chapters
  for (const subject of mainData.subjects) {
    for (const chapter of subject.chapters) {
      const key = `${subject.subject}-${chapter.chapter}`;
      chapterMap.set(key, {
        chapter: chapter.chapter,
        subject: subject.subject,
        mainWeightage: chapter.weightagePercent,
        advancedWeightage: 0,
        mainImportance: chapter.importance,
        advancedImportance: "MINIMAL",
        difference: 0,
        mainOnly: true,
        advancedOnly: false,
      });
    }
  }

  // Add/update with Advanced chapters
  for (const subject of advancedData.subjects) {
    for (const chapter of subject.chapters) {
      const key = `${subject.subject}-${chapter.chapter}`;
      if (chapterMap.has(key)) {
        const existing = chapterMap.get(key)!;
        existing.advancedWeightage = chapter.weightagePercent;
        existing.advancedImportance = chapter.importance;
        existing.mainOnly = false;
        existing.difference = chapter.weightagePercent - existing.mainWeightage;
      } else {
        chapterMap.set(key, {
          chapter: chapter.chapter,
          subject: subject.subject,
          mainWeightage: 0,
          advancedWeightage: chapter.weightagePercent,
          mainImportance: "MINIMAL",
          advancedImportance: chapter.importance,
          difference: chapter.weightagePercent,
          mainOnly: false,
          advancedOnly: true,
        });
      }
    }
  }

  // Sort by absolute difference (most different first)
  return Array.from(chapterMap.values())
    .filter(c => c.mainWeightage > 2 || c.advancedWeightage > 2) // Only significant chapters
    .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

interface Insight {
  type: "info" | "warning" | "tip";
  title: string;
  description: string;
  subject?: string;
}

function generateInsights(
  mainData: Awaited<ReturnType<typeof analyzeSyllabusWeightage>>,
  advancedData: Awaited<ReturnType<typeof analyzeSyllabusWeightage>>
): Insight[] {
  const insights: Insight[] = [];

  // Compare critical chapter counts
  const mainCritical = mainData.subjects.reduce((sum, s) => sum + s.criticalChapters, 0);
  const advancedCritical = advancedData.subjects.reduce((sum, s) => sum + s.criticalChapters, 0);

  if (advancedCritical > mainCritical) {
    insights.push({
      type: "warning",
      title: "JEE Advanced is more concentrated",
      description: `Advanced has ${advancedCritical} critical chapters vs ${mainCritical} in Main. Focus is narrower but deeper.`,
    });
  }

  // Find chapters that are much more important in Advanced
  for (const subject of mainData.subjects) {
    const advSubject = advancedData.subjects.find(s => s.subject === subject.subject);
    if (!advSubject) continue;

    for (const mainChapter of subject.chapters) {
      const advChapter = advSubject.chapters.find(c => c.chapter === mainChapter.chapter);
      if (advChapter && advChapter.weightagePercent > mainChapter.weightagePercent + 5) {
        insights.push({
          type: "tip",
          title: `${mainChapter.chapter} matters more in Advanced`,
          description: `${advChapter.weightagePercent.toFixed(1)}% in Advanced vs ${mainChapter.weightagePercent.toFixed(1)}% in Main`,
          subject: subject.subject,
        });
      }
    }
  }

  // Find chapters unique to each exam (with significant weightage)
  const mainChapters = new Set(
    mainData.subjects.flatMap(s => s.chapters.filter(c => c.weightagePercent > 3).map(c => `${s.subject}-${c.chapter}`))
  );
  const advancedChapters = new Set(
    advancedData.subjects.flatMap(s => s.chapters.filter(c => c.weightagePercent > 3).map(c => `${s.subject}-${c.chapter}`))
  );

  for (const chapter of advancedChapters) {
    if (!mainChapters.has(chapter)) {
      const [subject, name] = chapter.split("-");
      insights.push({
        type: "info",
        title: `${name} is Advanced-heavy`,
        description: "This chapter appears more frequently in JEE Advanced than Main.",
        subject,
      });
    }
  }

  return insights.slice(0, 8); // Limit to top 8 insights
}
