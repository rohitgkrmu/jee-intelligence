/**
 * JEE PDF Question Extraction Script
 *
 * This script extracts questions from JEE exam PDFs using:
 * 1. pdf-parse for text extraction
 * 2. Claude API for intelligent parsing into structured JSON
 *
 * Usage: npx tsx scripts/extract-questions.ts [--file <filename>] [--all]
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse");

dotenv.config();

const EXAM_PAPERS_DIR = path.join(process.cwd(), "exam papers");
const OUTPUT_DIR = path.join(process.cwd(), "scripts", "extracted");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
 * Parse filename to extract exam metadata
 * Examples:
 *   JEE_Main_2025_April_2_Shift1.pdf -> { year: 2025, session: "April 2 Shift 1", type: "MAIN" }
 *   JEE_Main_2024_April_4_Shift2.pdf -> { year: 2024, session: "April 4 Shift 2", type: "MAIN" }
 *   JEE_Main_2007.pdf -> { year: 2007, session: null, type: "MAIN" }
 *   JEE_Advanced_2024_Paper1.pdf -> { year: 2024, session: "Paper 1", type: "ADVANCED" }
 *   JEE_Advanced_2024_Paper2.pdf -> { year: 2024, session: "Paper 2", type: "ADVANCED" }
 */
function parseFilename(filename: string): {
  year: number;
  session: string | null;
  type: "MAIN" | "ADVANCED";
} {
  // Remove .pdf extension
  const name = filename.replace(".pdf", "");

  // Determine exam type
  const type = name.includes("Advanced") ? "ADVANCED" : "MAIN";

  // Extract year - find 4-digit number
  const yearMatch = name.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 0;

  let session: string | null = null;

  // Handle JEE Advanced papers: JEE_Advanced_2024_Paper1
  if (type === "ADVANCED") {
    const paperMatch = name.match(/Paper(\d)/);
    if (paperMatch) {
      session = `Paper ${paperMatch[1]}`;
    }
    return { year, session, type };
  }

  // Extract session info for JEE Main
  // Pattern: JEE_Main_2025_April_2_Shift1 or JEE_Main_2025_Jan_22_Shift2
  const sessionMatch = name.match(
    /\d{4}_([A-Za-z]+)_(\d+)(?:_Shift(\d+))?/
  );

  if (sessionMatch) {
    const month = sessionMatch[1];
    const day = sessionMatch[2];
    const shift = sessionMatch[3];
    session = shift
      ? `${month} ${day} Shift ${shift}`
      : `${month} ${day}`;
  } else {
    // Check for simpler pattern like JEE_Main_2025_April_8
    const simpleMatch = name.match(/\d{4}_([A-Za-z]+_\d+)/);
    if (simpleMatch) {
      session = simpleMatch[1].replace("_", " ");
    }
  }

  return { year, session, type };
}

/**
 * Extract text from PDF file
 */
async function extractPdfText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

/**
 * Use Claude to parse extracted text into structured questions
 */
async function parseQuestionsWithClaude(
  text: string,
  metadata: { year: number; session: string | null; type: "MAIN" | "ADVANCED" }
): Promise<ExtractedQuestion[]> {
  const client = new Anthropic();

  const systemPrompt = `You are an expert at parsing JEE exam papers. Your task is to extract individual questions from the provided exam paper text and structure them as JSON.

For JEE Main papers:
- Questions 1-20 are typically Physics (may include 5 numerical type)
- Questions 21-25 are typically Physics numerical
- Questions 26-45 are typically Chemistry (may include 5 numerical type)
- Questions 46-50 are typically Chemistry numerical
- Questions 51-70 are typically Mathematics (may include 5 numerical type)
- Questions 71-75 are typically Mathematics numerical

For JEE Advanced papers:
- Both Paper 1 and Paper 2 have Physics, Chemistry, and Mathematics sections
- Each section typically has 18 questions (total 54 per paper)
- Question types vary: single correct MCQ, multiple correct MCQ, integer type, matrix matching, paragraph-based
- Sections may be organized by type (e.g., Section 1: MCQ Single, Section 2: MCQ Multiple, Section 3: Numerical)
- Use context clues to determine subject and question type

Use context clues (formulas, terminology) to determine the subject:
- Physics: mechanics, waves, optics, thermodynamics, electromagnetism, modern physics, rotational motion
- Chemistry: organic, inorganic, physical chemistry, periodic table, reactions, coordination compounds
- Mathematics: calculus, algebra, trigonometry, coordinate geometry, vectors, probability, complex numbers

Question types:
- MCQ_SINGLE: Multiple choice with single correct answer (options A, B, C, D)
- MCQ_MULTIPLE: Multiple correct answers possible (more than one option can be correct)
- NUMERICAL: Answer is a decimal/integer value (no options)
- INTEGER: Answer is a single integer (0-9 typically)

When extracting:
1. Preserve mathematical notation as much as possible (use LaTeX-like notation)
2. Include ALL options for MCQ questions
3. Extract the correct answer from the answer key section if present
4. Mark difficulty based on complexity: EASY (direct formula), MEDIUM (multi-step), HARD (complex reasoning)
5. Identify the chapter/topic when possible
6. For JEE Advanced, pay attention to section headers to determine question type`;

  const userPrompt = `Parse the following JEE ${metadata.type} ${metadata.year}${metadata.session ? ` (${metadata.session})` : ""} exam paper text and extract all questions as structured JSON.

Return ONLY a valid JSON array of question objects. Each question should have:
- questionNumber: number
- subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS"
- questionText: string (the full question text, preserve math notation)
- options: array of {id: "A"|"B"|"C"|"D", text: string} (only for MCQ)
- correctAnswer: string (the answer - could be "A", "B,C", "3.14", etc.)
- questionType: "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER"
- chapter: string (if determinable, e.g., "Mechanics", "Organic Chemistry", "Calculus")
- topic: string (if determinable, e.g., "Projectile Motion", "Aldehydes", "Integration")
- concept: string (specific concept, e.g., "Range of projectile", "Aldol condensation")
- difficulty: "EASY" | "MEDIUM" | "HARD"
- skills: array of applicable skills from ["CONCEPTUAL", "NUMERICAL", "APPLICATION", "ANALYTICAL", "DERIVATION", "GRAPHICAL"]

If you cannot determine an answer key, set correctAnswer to "UNKNOWN".
If the text is too garbled or unreadable, return an empty array [].

EXAM PAPER TEXT:
${text.substring(0, 100000)}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16000,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text content from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from response - find the JSON array in the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0];

      // Try to fix common JSON issues
      try {
        return JSON.parse(jsonStr) as ExtractedQuestion[];
      } catch (parseError) {
        console.log("  Attempting to repair malformed JSON...");

        // Fix common issues:
        // 1. Trailing commas before ] or }
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");
        // 2. Missing commas between objects
        jsonStr = jsonStr.replace(/}(\s*){/g, "},{");
        // 3. Control characters (except newlines and tabs)
        jsonStr = jsonStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

        try {
          const result = JSON.parse(jsonStr) as ExtractedQuestion[];
          console.log("  JSON repair successful!");
          return result;
        } catch (repairError) {
          // Try a more aggressive approach - escape newlines within string values
          console.log("  Trying aggressive JSON repair...");
          // Find strings and escape newlines within them
          jsonStr = jsonStr.replace(/"([^"\\]|\\.)*"/g, (match) => {
            return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
          });

          try {
            const result = JSON.parse(jsonStr) as ExtractedQuestion[];
            console.log("  Aggressive JSON repair successful!");
            return result;
          } catch (finalError) {
            // Try to salvage partial results by finding complete objects
            console.log("  Attempting to salvage partial results...");
            const partialResults: ExtractedQuestion[] = [];
            const objectRegex = /\{[^{}]*"questionNumber"\s*:\s*\d+[^{}]*"correctAnswer"\s*:\s*"[^"]*"[^{}]*\}/g;
            let match;
            while ((match = objectRegex.exec(jsonStr)) !== null) {
              try {
                const obj = JSON.parse(match[0]);
                if (obj.questionNumber && obj.subject && obj.questionText) {
                  partialResults.push(obj as ExtractedQuestion);
                }
              } catch {
                // Skip malformed objects
              }
            }
            if (partialResults.length > 0) {
              console.log(`  Salvaged ${partialResults.length} questions from partial results`);
              return partialResults;
            }
            console.error("  JSON repair failed:", finalError);
            return [];
          }
        }
      }
    }

    console.error("No JSON array found in Claude response");
    return [];
  } catch (error) {
    console.error("Error calling Claude API:", error);
    throw error;
  }
}

/**
 * Process a single PDF file
 */
async function processPdf(filename: string): Promise<ExtractionResult> {
  const filePath = path.join(EXAM_PAPERS_DIR, filename);
  console.log(`\nProcessing: ${filename}`);

  // Parse metadata from filename
  const metadata = parseFilename(filename);
  console.log(`  Year: ${metadata.year}, Session: ${metadata.session || "N/A"}, Type: ${metadata.type}`);

  // Extract text from PDF
  console.log("  Extracting PDF text...");
  const pdfText = await extractPdfText(filePath);
  console.log(`  Extracted ${pdfText.length} characters`);

  // Parse questions with Claude
  console.log("  Parsing questions with Claude API...");
  const questions = await parseQuestionsWithClaude(pdfText, metadata);
  console.log(`  Extracted ${questions.length} questions`);

  // Count by subject
  const subjectCounts = questions.reduce(
    (acc, q) => {
      acc[q.subject] = (acc[q.subject] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log(`  Subject distribution:`, subjectCounts);

  return {
    filename,
    examYear: metadata.year,
    examSession: metadata.session || "",
    examType: metadata.type,
    questions,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Save extraction result to JSON file
 */
function saveResult(result: ExtractionResult): void {
  const outputFilename = result.filename.replace(".pdf", ".json");
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`  Saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is required");
    console.error("Please add it to your .env file");
    process.exit(1);
  }

  // Get list of PDFs
  const pdfFiles = fs
    .readdirSync(EXAM_PAPERS_DIR)
    .filter((f) => f.endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.error(`No PDF files found in ${EXAM_PAPERS_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${pdfFiles.length} PDF files in ${EXAM_PAPERS_DIR}`);

  // Check for --force flag to re-extract already processed files
  const forceReextract = args.includes("--force");

  // Get list of already extracted files
  const existingExtractions = new Set(
    fs.readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(".json", ".pdf"))
  );

  // Determine which files to process
  let filesToProcess: string[] = [];

  if (args.includes("--all")) {
    if (forceReextract) {
      filesToProcess = pdfFiles;
    } else {
      // Skip already extracted files
      filesToProcess = pdfFiles.filter(f => !existingExtractions.has(f));
      const skipped = pdfFiles.length - filesToProcess.length;
      if (skipped > 0) {
        console.log(`Skipping ${skipped} already extracted files (use --force to re-extract)`);
      }
    }
  } else if (args.includes("--file")) {
    const fileIndex = args.indexOf("--file");
    const filename = args[fileIndex + 1];
    if (!filename || !pdfFiles.includes(filename)) {
      console.error(`File not found: ${filename}`);
      console.error(`Available files:`);
      pdfFiles.forEach((f) => console.error(`  - ${f}`));
      process.exit(1);
    }
    filesToProcess = [filename];
  } else {
    // Default: process first file as a test
    filesToProcess = [pdfFiles[0]];
    console.log("\nNo arguments provided. Processing first file as a test.");
    console.log("Use --all to process all files or --file <filename> for a specific file.\n");
  }

  // Process files
  let successCount = 0;
  let failCount = 0;

  for (const filename of filesToProcess) {
    try {
      const result = await processPdf(filename);
      saveResult(result);
      successCount++;

      // Add delay between API calls to avoid rate limiting
      if (filesToProcess.indexOf(filename) < filesToProcess.length - 1) {
        console.log("  Waiting 2 seconds before next file...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`  Error processing ${filename}:`, error);
      failCount++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Processed: ${successCount + failCount} files`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
