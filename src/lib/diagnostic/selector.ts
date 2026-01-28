import { prisma } from "@/lib/db";
import type { Subject, Difficulty, DiagnosticItem } from "@prisma/client";

export interface SelectionConfig {
  totalQuestions: number;
  subjectDistribution: Record<Subject, number>;
  difficultyDistribution: Record<Difficulty, number>;
}

const DEFAULT_CONFIG: SelectionConfig = {
  totalQuestions: 12,
  subjectDistribution: {
    PHYSICS: 4,
    CHEMISTRY: 4,
    MATHEMATICS: 4,
  },
  difficultyDistribution: {
    EASY: 3, // 25%
    MEDIUM: 6, // 50%
    HARD: 3, // 25%
  },
};

export async function selectDiagnosticQuestions(
  config: SelectionConfig = DEFAULT_CONFIG
): Promise<string[]> {
  const selectedIds: string[] = [];
  const usedConcepts = new Set<string>();

  // Get all active diagnostic items
  const allItems = await prisma.diagnosticItem.findMany({
    where: { isActive: true },
    orderBy: [{ frequencyWeight: "desc" }, { priorityScore: "desc" }],
  });

  // Group by subject and difficulty
  const itemsBySubjectDifficulty: Record<
    string,
    DiagnosticItem[]
  > = {};

  for (const item of allItems) {
    const key = `${item.subject}:${item.difficulty}`;
    if (!itemsBySubjectDifficulty[key]) {
      itemsBySubjectDifficulty[key] = [];
    }
    itemsBySubjectDifficulty[key].push(item);
  }

  // Select questions for each subject
  const subjects: Subject[] = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
  const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

  for (const subject of subjects) {
    const targetCount = config.subjectDistribution[subject];
    let subjectSelected = 0;

    // Distribute by difficulty proportionally
    for (const difficulty of difficulties) {
      const difficultyTarget = Math.round(
        (config.difficultyDistribution[difficulty] / config.totalQuestions) *
          targetCount
      );

      const key = `${subject}:${difficulty}`;
      const availableItems = itemsBySubjectDifficulty[key] || [];

      // Filter out items with already-used concepts
      const filteredItems = availableItems.filter(
        (item) => !usedConcepts.has(item.concept)
      );

      // Select items
      let selected = 0;
      for (const item of filteredItems) {
        if (selected >= difficultyTarget) break;
        if (subjectSelected >= targetCount) break;

        selectedIds.push(item.id);
        usedConcepts.add(item.concept);
        selected++;
        subjectSelected++;
      }
    }

    // If we haven't reached target, fill with any remaining items
    if (subjectSelected < targetCount) {
      for (const difficulty of difficulties) {
        const key = `${subject}:${difficulty}`;
        const availableItems = itemsBySubjectDifficulty[key] || [];

        for (const item of availableItems) {
          if (subjectSelected >= targetCount) break;
          if (selectedIds.includes(item.id)) continue;
          if (usedConcepts.has(item.concept)) continue;

          selectedIds.push(item.id);
          usedConcepts.add(item.concept);
          subjectSelected++;
        }
      }
    }
  }

  // Shuffle the selected questions
  return shuffleArray(selectedIds);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getDiagnosticItem(id: string): Promise<DiagnosticItem | null> {
  return prisma.diagnosticItem.findUnique({
    where: { id },
  });
}

export async function getDiagnosticItems(ids: string[]): Promise<DiagnosticItem[]> {
  return prisma.diagnosticItem.findMany({
    where: { id: { in: ids } },
  });
}
