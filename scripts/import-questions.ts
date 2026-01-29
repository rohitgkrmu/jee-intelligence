/**
 * JEE Question Import Script
 *
 * This script imports extracted questions from JSON files into the database.
 * It reads from scripts/extracted/*.json and uses Prisma to bulk upsert.
 *
 * Usage: npx tsx scripts/import-questions.ts [--file <filename>] [--all] [--dry-run]
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const EXTRACTED_DIR = path.join(process.cwd(), "scripts", "extracted");

// Initialize Prisma with PG adapter (same as src/lib/db.ts)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Dataset source name for PW papers
const DATASET_SOURCE_NAME = "PW JEE Main Papers 2007-2025";

interface ExtractedQuestion {
  questionNumber: number;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  questionText: string;
  options?: { id: string; text: string }[];
  correctAnswer: string;
  questionType: "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER";
  chapter?: string;
  topic?: string;
  concept?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  skills?: string[];
}

interface ExtractionResult {
  filename: string;
  examYear: number;
  examSession: string;
  examType: "MAIN" | "ADVANCED";
  questions: ExtractedQuestion[];
  extractedAt: string;
}

/**
 * Ensure the dataset source exists in the database
 */
async function ensureDatasetSource(): Promise<string> {
  let source = await prisma.datasetSource.findUnique({
    where: { name: DATASET_SOURCE_NAME },
  });

  if (!source) {
    console.log(`Creating dataset source: ${DATASET_SOURCE_NAME}`);
    source = await prisma.datasetSource.create({
      data: {
        name: DATASET_SOURCE_NAME,
        type: "PUBLIC",
        description: "JEE Main papers from pw.live (Physics Wallah)",
        sourceUrl: "https://pw.live",
        isActive: true,
      },
    });
  }

  return source.id;
}

/**
 * Map extracted question types to Prisma enum
 */
function mapQuestionType(
  type: string
): "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER" | "MATCH_THE_COLUMN" | "ASSERTION_REASON" | "COMPREHENSION" {
  const mapping: Record<string, "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER"> = {
    MCQ_SINGLE: "MCQ_SINGLE",
    MCQ_MULTIPLE: "MCQ_MULTIPLE",
    NUMERICAL: "NUMERICAL",
    INTEGER: "INTEGER",
  };
  return mapping[type] || "MCQ_SINGLE";
}

/**
 * Map extracted skills to Prisma enum
 */
function mapSkills(
  skills?: string[]
): ("CONCEPTUAL" | "NUMERICAL" | "APPLICATION" | "ANALYTICAL" | "DERIVATION" | "GRAPHICAL")[] {
  if (!skills || skills.length === 0) {
    return ["CONCEPTUAL"];
  }

  const validSkills = new Set([
    "CONCEPTUAL",
    "NUMERICAL",
    "APPLICATION",
    "ANALYTICAL",
    "DERIVATION",
    "GRAPHICAL",
  ]);

  return skills.filter((s) =>
    validSkills.has(s.toUpperCase())
  ) as ("CONCEPTUAL" | "NUMERICAL" | "APPLICATION" | "ANALYTICAL" | "DERIVATION" | "GRAPHICAL")[];
}

/**
 * Import questions from a single JSON file
 */
async function importFromFile(
  filename: string,
  datasetSourceId: string,
  dryRun: boolean
): Promise<{ imported: number; skipped: number; errors: number }> {
  const filePath = path.join(EXTRACTED_DIR, filename);
  console.log(`\nImporting: ${filename}`);

  // Read and parse JSON
  const content = fs.readFileSync(filePath, "utf-8");
  const data: ExtractionResult = JSON.parse(content);

  console.log(
    `  Exam: ${data.examType} ${data.examYear} ${data.examSession || ""}`
  );
  console.log(`  Questions in file: ${data.questions.length}`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const q of data.questions) {
    try {
      // Skip questions with unknown answers
      if (q.correctAnswer === "UNKNOWN" || !q.correctAnswer) {
        console.log(`  Skipping Q${q.questionNumber}: Unknown answer`);
        skipped++;
        continue;
      }

      // Skip questions with empty text
      if (!q.questionText || q.questionText.trim().length < 10) {
        console.log(`  Skipping Q${q.questionNumber}: Empty or too short question text`);
        skipped++;
        continue;
      }

      // Prepare question data
      const questionData = {
        datasetSourceId,
        examType: data.examType as "MAIN" | "ADVANCED",
        examYear: data.examYear,
        examSession: data.examSession || null,
        subject: q.subject,
        chapter: q.chapter || "Unknown",
        topic: q.topic || "Unknown",
        concept: q.concept || "Unknown",
        questionType: mapQuestionType(q.questionType),
        difficulty: (q.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
        skills: mapSkills(q.skills),
        questionText: q.questionText,
        options: q.options || null,
        correctAnswer: q.correctAnswer,
        solution: null,
        isActive: true,
        tags: [
          `year:${data.examYear}`,
          `type:${data.examType}`,
          `subject:${q.subject}`,
        ],
      };

      if (dryRun) {
        console.log(
          `  [DRY-RUN] Would import Q${q.questionNumber}: ${q.subject} - ${q.chapter || "Unknown"}`
        );
        imported++;
      } else {
        // Check if similar question already exists (by text hash or similar)
        const existingQuestion = await prisma.question.findFirst({
          where: {
            examYear: data.examYear,
            examSession: data.examSession || null,
            subject: q.subject,
            questionText: {
              startsWith: q.questionText.substring(0, 100),
            },
          },
        });

        if (existingQuestion) {
          console.log(
            `  Skipping Q${q.questionNumber}: Similar question exists (ID: ${existingQuestion.id})`
          );
          skipped++;
          continue;
        }

        // Create new question
        await prisma.question.create({
          data: questionData,
        });

        console.log(
          `  Imported Q${q.questionNumber}: ${q.subject} - ${q.chapter || "Unknown"}`
        );
        imported++;
      }
    } catch (error) {
      console.error(`  Error importing Q${q.questionNumber}:`, error);
      errors++;
    }
  }

  return { imported, skipped, errors };
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (dryRun) {
    console.log("*** DRY RUN MODE - No changes will be made ***\n");
  }

  // Ensure extracted directory exists
  if (!fs.existsSync(EXTRACTED_DIR)) {
    console.error(`Extracted directory not found: ${EXTRACTED_DIR}`);
    console.error("Please run extract-questions.ts first.");
    process.exit(1);
  }

  // Get list of JSON files
  const jsonFiles = fs
    .readdirSync(EXTRACTED_DIR)
    .filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.error(`No JSON files found in ${EXTRACTED_DIR}`);
    console.error("Please run extract-questions.ts first.");
    process.exit(1);
  }

  console.log(`Found ${jsonFiles.length} JSON files in ${EXTRACTED_DIR}`);

  // Determine which files to process
  let filesToProcess: string[] = [];

  if (args.includes("--all")) {
    filesToProcess = jsonFiles;
  } else if (args.includes("--file")) {
    const fileIndex = args.indexOf("--file");
    const filename = args[fileIndex + 1];
    if (!filename || !jsonFiles.includes(filename)) {
      console.error(`File not found: ${filename}`);
      console.error(`Available files:`);
      jsonFiles.forEach((f) => console.error(`  - ${f}`));
      process.exit(1);
    }
    filesToProcess = [filename];
  } else {
    // Default: process all files
    filesToProcess = jsonFiles;
  }

  // Ensure dataset source exists
  const datasetSourceId = await ensureDatasetSource();
  console.log(`Dataset source ID: ${datasetSourceId}`);

  // Process files
  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const filename of filesToProcess) {
    try {
      const result = await importFromFile(filename, datasetSourceId, dryRun);
      totalImported += result.imported;
      totalSkipped += result.skipped;
      totalErrors += result.errors;
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
      totalErrors++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Files processed: ${filesToProcess.length}`);
  console.log(`Questions imported: ${totalImported}`);
  console.log(`Questions skipped: ${totalSkipped}`);
  console.log(`Errors: ${totalErrors}`);

  if (dryRun) {
    console.log("\n*** This was a dry run. Run without --dry-run to actually import. ***");
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
