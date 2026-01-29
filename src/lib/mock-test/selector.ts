import { prisma } from "@/lib/db";
import type { Subject, Difficulty, Question } from "@prisma/client";
import { DEFAULT_SELECTION_CONFIG, type SelectionConfig, type MockTestQuestion } from "./types";

type QuestionWithoutRelations = Omit<Question, "datasetSource">;

interface SubjectQuestions {
  physics: string[];
  chemistry: string[];
  mathematics: string[];
}

/**
 * Select 90 questions for a full-length mock test
 * - 30 questions per subject (Physics, Chemistry, Mathematics)
 * - Section A (Q1-20): MCQ_SINGLE with difficulty distribution
 * - Section B (Q21-30): NUMERICAL/INTEGER with difficulty distribution
 * - Ensures chapter diversity (max 2 questions per chapter)
 */
export async function selectMockTestQuestions(
  config: SelectionConfig = DEFAULT_SELECTION_CONFIG
): Promise<SubjectQuestions> {
  const subjects: Subject[] = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
  const result: SubjectQuestions = {
    physics: [],
    chemistry: [],
    mathematics: [],
  };

  for (const subject of subjects) {
    const subjectKey = subject.toLowerCase() as keyof SubjectQuestions;
    const questionIds = await selectQuestionsForSubject(subject, config);
    result[subjectKey] = questionIds;
  }

  return result;
}

async function selectQuestionsForSubject(
  subject: Subject,
  config: SelectionConfig
): Promise<string[]> {
  const usedChapters = new Map<string, number>();
  const selectedIds: string[] = [];

  // Select Section A questions (MCQ_SINGLE)
  const sectionAIds = await selectSectionQuestions(
    subject,
    ["MCQ_SINGLE"],
    config.sectionAQuestions,
    config.difficultyDistribution.sectionA,
    config.maxQuestionsPerChapter,
    usedChapters
  );
  selectedIds.push(...sectionAIds);

  // Select Section B questions (NUMERICAL or INTEGER)
  const sectionBIds = await selectSectionQuestions(
    subject,
    ["NUMERICAL", "INTEGER"],
    config.sectionBQuestions,
    config.difficultyDistribution.sectionB,
    config.maxQuestionsPerChapter,
    usedChapters
  );
  selectedIds.push(...sectionBIds);

  return selectedIds;
}

async function selectSectionQuestions(
  subject: Subject,
  questionTypes: string[],
  totalNeeded: number,
  difficultyDistribution: Record<Difficulty, number>,
  maxPerChapter: number,
  usedChapters: Map<string, number>
): Promise<string[]> {
  const selectedIds: string[] = [];
  const difficulties: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

  // Get all available questions for this section
  const availableQuestions = await prisma.question.findMany({
    where: {
      subject,
      questionType: { in: questionTypes as never[] },
      isActive: true,
      examType: "MAIN",
    },
    orderBy: [{ examYear: "desc" }],
  });

  // Group by difficulty
  const questionsByDifficulty: Record<Difficulty, QuestionWithoutRelations[]> = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
  };

  for (const q of availableQuestions) {
    questionsByDifficulty[q.difficulty].push(q);
  }

  // Select questions by difficulty
  for (const difficulty of difficulties) {
    const targetCount = difficultyDistribution[difficulty];
    const available = questionsByDifficulty[difficulty];

    // Shuffle available questions for randomness
    const shuffled = shuffleArray([...available]);

    let selected = 0;
    for (const question of shuffled) {
      if (selected >= targetCount) break;

      // Check chapter limit
      const chapterCount = usedChapters.get(question.chapter) || 0;
      if (chapterCount >= maxPerChapter) continue;

      // Check if already selected
      if (selectedIds.includes(question.id)) continue;

      selectedIds.push(question.id);
      usedChapters.set(question.chapter, chapterCount + 1);
      selected++;
    }
  }

  // If we don't have enough questions, fill with any available
  if (selectedIds.length < totalNeeded) {
    const allAvailable = shuffleArray([...availableQuestions]);
    for (const question of allAvailable) {
      if (selectedIds.length >= totalNeeded) break;
      if (selectedIds.includes(question.id)) continue;

      const chapterCount = usedChapters.get(question.chapter) || 0;
      // Relax chapter limit if needed
      if (chapterCount >= maxPerChapter * 2) continue;

      selectedIds.push(question.id);
      usedChapters.set(question.chapter, chapterCount + 1);
    }
  }

  return selectedIds;
}

/**
 * Get full question details for mock test display
 */
export async function getMockTestQuestions(
  questionIds: SubjectQuestions
): Promise<{
  physics: MockTestQuestion[];
  chemistry: MockTestQuestion[];
  mathematics: MockTestQuestion[];
}> {
  const result = {
    physics: [] as MockTestQuestion[],
    chemistry: [] as MockTestQuestion[],
    mathematics: [] as MockTestQuestion[],
  };

  for (const [subject, ids] of Object.entries(questionIds)) {
    const questions = await prisma.question.findMany({
      where: { id: { in: ids } },
    });

    // Create a map for ordering
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Process in order, maintaining Section A (1-20) and Section B (21-30)
    const subjectQuestions: MockTestQuestion[] = [];
    let questionNumber = 1;

    for (const id of ids) {
      const q = questionMap.get(id);
      if (!q) continue;

      const isNumerical = q.questionType === "NUMERICAL" || q.questionType === "INTEGER";
      const sectionType = questionNumber <= 20 ? "A" : "B";

      subjectQuestions.push({
        id: q.id,
        subject: q.subject,
        chapter: q.chapter,
        questionType: q.questionType,
        difficulty: q.difficulty,
        questionText: q.questionText,
        options: q.options as { id: string; text: string }[] | null,
        correctAnswer: q.correctAnswer,
        solution: q.solution,
        sectionType: isNumerical ? "B" : sectionType as "A" | "B",
        questionNumber,
      });

      questionNumber++;
    }

    result[subject as keyof typeof result] = subjectQuestions;
  }

  return result;
}

/**
 * Get a single question by ID
 */
export async function getQuestion(id: string): Promise<Question | null> {
  return prisma.question.findUnique({
    where: { id },
  });
}

/**
 * Get multiple questions by IDs
 */
export async function getQuestions(ids: string[]): Promise<Question[]> {
  return prisma.question.findMany({
    where: { id: { in: ids } },
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
