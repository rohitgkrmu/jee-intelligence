/**
 * ExamSIDE JEE Question Scraper
 *
 * Scrapes JEE Main questions from ExamSIDE organized by subject and chapter.
 *
 * Usage: npx tsx scripts/scrape-examside.ts
 */

import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.join(process.cwd(), "data", "examside");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface Chapter {
  name: string;
  slug: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
}

// Complete chapter list for JEE Main
const chapters: Chapter[] = [
  // Physics
  { name: "Units and Measurements", slug: "units-and-measurements", subject: "PHYSICS" },
  { name: "Motion in a Straight Line", slug: "motion-in-a-straight-line", subject: "PHYSICS" },
  { name: "Motion in a Plane", slug: "motion-in-a-plane", subject: "PHYSICS" },
  { name: "Circular Motion", slug: "circular-motion", subject: "PHYSICS" },
  { name: "Laws of Motion", slug: "laws-of-motion", subject: "PHYSICS" },
  { name: "Work Power Energy", slug: "work-power-and-energy", subject: "PHYSICS" },
  { name: "Center of Mass", slug: "center-of-mass-and-collision", subject: "PHYSICS" },
  { name: "Rotational Motion", slug: "rotational-motion", subject: "PHYSICS" },
  { name: "Gravitation", slug: "gravitation", subject: "PHYSICS" },
  { name: "Properties of Matter", slug: "properties-of-matter", subject: "PHYSICS" },
  { name: "Heat and Thermodynamics", slug: "heat-and-thermodynamics", subject: "PHYSICS" },
  { name: "Simple Harmonic Motion", slug: "simple-harmonic-motion", subject: "PHYSICS" },
  { name: "Waves", slug: "waves", subject: "PHYSICS" },
  { name: "Electrostatics", slug: "electrostatics", subject: "PHYSICS" },
  { name: "Capacitor", slug: "capacitor", subject: "PHYSICS" },
  { name: "Current Electricity", slug: "current-electricity", subject: "PHYSICS" },
  { name: "Magnetic Effect of Current", slug: "magnetic-effect-of-current", subject: "PHYSICS" },
  { name: "Magnetic Properties of Matter", slug: "magnetic-properties-of-matter", subject: "PHYSICS" },
  { name: "Electromagnetic Induction", slug: "electromagnetic-induction", subject: "PHYSICS" },
  { name: "Alternating Current", slug: "alternating-current", subject: "PHYSICS" },
  { name: "Electromagnetic Waves", slug: "electromagnetic-waves", subject: "PHYSICS" },
  { name: "Wave Optics", slug: "wave-optics", subject: "PHYSICS" },
  { name: "Geometrical Optics", slug: "geometrical-optics", subject: "PHYSICS" },
  { name: "Atoms and Nuclei", slug: "atoms-and-nuclei", subject: "PHYSICS" },
  { name: "Dual Nature of Radiation", slug: "dual-nature-of-radiation", subject: "PHYSICS" },
  { name: "Semiconductor", slug: "semiconductor", subject: "PHYSICS" },

  // Chemistry - Physical
  { name: "Mole Concept", slug: "mole-concept", subject: "CHEMISTRY" },
  { name: "Atomic Structure", slug: "atomic-structure", subject: "CHEMISTRY" },
  { name: "Chemical Bonding", slug: "chemical-bonding-and-molecular-structure", subject: "CHEMISTRY" },
  { name: "States of Matter", slug: "states-of-matter", subject: "CHEMISTRY" },
  { name: "Thermodynamics", slug: "thermodynamics", subject: "CHEMISTRY" },
  { name: "Chemical Equilibrium", slug: "chemical-equilibrium", subject: "CHEMISTRY" },
  { name: "Ionic Equilibrium", slug: "ionic-equilibrium", subject: "CHEMISTRY" },
  { name: "Redox Reactions", slug: "redox-reactions-and-electrochemistry", subject: "CHEMISTRY" },
  { name: "Electrochemistry", slug: "electrochemistry", subject: "CHEMISTRY" },
  { name: "Chemical Kinetics", slug: "chemical-kinetics", subject: "CHEMISTRY" },
  { name: "Surface Chemistry", slug: "surface-chemistry", subject: "CHEMISTRY" },
  { name: "Solutions", slug: "solutions", subject: "CHEMISTRY" },
  { name: "Solid State", slug: "solid-state", subject: "CHEMISTRY" },

  // Chemistry - Inorganic
  { name: "Periodic Table", slug: "periodic-table-and-periodicity", subject: "CHEMISTRY" },
  { name: "s-Block Elements", slug: "s-block-elements", subject: "CHEMISTRY" },
  { name: "p-Block Elements", slug: "p-block-elements", subject: "CHEMISTRY" },
  { name: "d and f Block Elements", slug: "d-and-f-block-elements", subject: "CHEMISTRY" },
  { name: "Coordination Compounds", slug: "coordination-compounds", subject: "CHEMISTRY" },
  { name: "Metallurgy", slug: "metallurgy", subject: "CHEMISTRY" },
  { name: "Qualitative Analysis", slug: "qualitative-analysis", subject: "CHEMISTRY" },

  // Chemistry - Organic
  { name: "Basic Organic Chemistry", slug: "some-basic-concepts-of-organic-chemistry", subject: "CHEMISTRY" },
  { name: "Hydrocarbons", slug: "hydrocarbons", subject: "CHEMISTRY" },
  { name: "Haloalkanes", slug: "haloalkanes-and-haloarenes", subject: "CHEMISTRY" },
  { name: "Alcohols and Ethers", slug: "alcohols-phenols-and-ethers", subject: "CHEMISTRY" },
  { name: "Aldehydes and Ketones", slug: "aldehydes-ketones-and-carboxylic-acids", subject: "CHEMISTRY" },
  { name: "Amines", slug: "amines", subject: "CHEMISTRY" },
  { name: "Biomolecules", slug: "biomolecules", subject: "CHEMISTRY" },
  { name: "Polymers", slug: "polymers", subject: "CHEMISTRY" },
  { name: "Chemistry in Everyday Life", slug: "chemistry-in-everyday-life", subject: "CHEMISTRY" },

  // Mathematics
  { name: "Sets and Relations", slug: "sets-relations-and-functions", subject: "MATHEMATICS" },
  { name: "Complex Numbers", slug: "complex-numbers", subject: "MATHEMATICS" },
  { name: "Quadratic Equations", slug: "quadratic-equation-and-inequalities", subject: "MATHEMATICS" },
  { name: "Sequences and Series", slug: "sequences-and-series", subject: "MATHEMATICS" },
  { name: "Permutations and Combinations", slug: "permutations-and-combinations", subject: "MATHEMATICS" },
  { name: "Binomial Theorem", slug: "binomial-theorem", subject: "MATHEMATICS" },
  { name: "Matrices and Determinants", slug: "matrices-and-determinants", subject: "MATHEMATICS" },
  { name: "Trigonometry", slug: "trigonometric-functions-and-equations", subject: "MATHEMATICS" },
  { name: "Coordinate Geometry", slug: "straight-lines-and-pair-of-straight-lines", subject: "MATHEMATICS" },
  { name: "Circle", slug: "circle", subject: "MATHEMATICS" },
  { name: "Conic Sections", slug: "conic-sections", subject: "MATHEMATICS" },
  { name: "3D Geometry", slug: "three-dimensional-geometry", subject: "MATHEMATICS" },
  { name: "Vectors", slug: "vector-algebra", subject: "MATHEMATICS" },
  { name: "Limits and Continuity", slug: "limits-continuity-and-differentiability", subject: "MATHEMATICS" },
  { name: "Differentiation", slug: "differentiation", subject: "MATHEMATICS" },
  { name: "Application of Derivatives", slug: "application-of-derivatives", subject: "MATHEMATICS" },
  { name: "Indefinite Integration", slug: "indefinite-integrals", subject: "MATHEMATICS" },
  { name: "Definite Integration", slug: "definite-integrals", subject: "MATHEMATICS" },
  { name: "Area Under Curves", slug: "area-under-the-curves", subject: "MATHEMATICS" },
  { name: "Differential Equations", slug: "differential-equations", subject: "MATHEMATICS" },
  { name: "Probability", slug: "probability", subject: "MATHEMATICS" },
  { name: "Statistics", slug: "statistics", subject: "MATHEMATICS" },
  { name: "Mathematical Reasoning", slug: "mathematical-reasoning", subject: "MATHEMATICS" },
];

interface ScrapedQuestion {
  questionNumber: number;
  chapter: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  questionText: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  year: number;
  session: string;
  questionType: "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER";
  source: string;
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Failed after retries");
}

function parseYear(yearStr: string): { year: number; session: string } {
  // Parse strings like "JEE Main 2025 (Online) 8th April Evening Shift"
  const yearMatch = yearStr.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1]) : 0;

  const sessionMatch = yearStr.match(/(\d+(?:st|nd|rd|th)?\s*\w+\s*(?:Morning|Evening)?\s*Shift)/i);
  const session = sessionMatch ? sessionMatch[1] : "";

  return { year, session };
}

function extractQuestionsFromHTML(html: string, chapter: Chapter): ScrapedQuestion[] {
  const questions: ScrapedQuestion[] = [];

  // This is a simplified parser - in reality you'd use cheerio or similar
  // For now, we'll extract what we can from the HTML structure

  // Look for question blocks - ExamSIDE uses specific class patterns
  const questionBlockRegex = /<div[^>]*class="[^"]*question[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<div[^>]*class="[^"]*options/gi;

  let questionNum = 1;
  let match;

  // Simplified extraction - in production use a proper HTML parser
  const questionPattern = /Question\s*(\d+)[^]*?<p[^>]*>(.*?)<\/p>/gi;

  while ((match = questionPattern.exec(html)) !== null) {
    const qNum = parseInt(match[1]) || questionNum++;
    const qText = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();

    if (qText.length > 20) {
      questions.push({
        questionNumber: qNum,
        chapter: chapter.name,
        subject: chapter.subject,
        questionText: qText,
        options: [],
        correctAnswer: "UNKNOWN",
        year: 0,
        session: "",
        questionType: "MCQ_SINGLE",
        source: "ExamSIDE",
      });
    }
  }

  return questions;
}

async function scrapeChapter(chapter: Chapter): Promise<ScrapedQuestion[]> {
  const baseUrl = `https://questions.examside.com/past-years/jee/jee-main/${chapter.subject.toLowerCase()}/${chapter.slug}`;

  console.log(`\nScraping: ${chapter.subject} - ${chapter.name}`);
  console.log(`  URL: ${baseUrl}`);

  try {
    const html = await fetchWithRetry(baseUrl);
    const questions = extractQuestionsFromHTML(html, chapter);
    console.log(`  Found: ${questions.length} questions`);
    return questions;
  } catch (error) {
    console.error(`  Error: ${error}`);
    return [];
  }
}

async function main() {
  console.log("ExamSIDE JEE Question Scraper");
  console.log("=============================\n");
  console.log(`Total chapters to scrape: ${chapters.length}`);

  const allQuestions: ScrapedQuestion[] = [];

  // Process subjects sequentially to avoid rate limiting
  const subjects = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const;

  for (const subject of subjects) {
    const subjectChapters = chapters.filter((c) => c.subject === subject);
    console.log(`\n=== ${subject} (${subjectChapters.length} chapters) ===`);

    for (const chapter of subjectChapters) {
      const questions = await scrapeChapter(chapter);
      allQuestions.push(...questions);

      // Rate limiting delay
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Save per-subject file
    const subjectFile = path.join(OUTPUT_DIR, `jee_main_${subject.toLowerCase()}.json`);
    const subjectQuestions = allQuestions.filter((q) => q.subject === subject);
    fs.writeFileSync(subjectFile, JSON.stringify(subjectQuestions, null, 2));
    console.log(`\nSaved ${subjectQuestions.length} ${subject} questions to ${subjectFile}`);
  }

  // Save combined file
  const combinedFile = path.join(OUTPUT_DIR, "jee_main_all.json");
  fs.writeFileSync(combinedFile, JSON.stringify(allQuestions, null, 2));

  console.log("\n=== Summary ===");
  console.log(`Total questions scraped: ${allQuestions.length}`);
  console.log(`Physics: ${allQuestions.filter((q) => q.subject === "PHYSICS").length}`);
  console.log(`Chemistry: ${allQuestions.filter((q) => q.subject === "CHEMISTRY").length}`);
  console.log(`Mathematics: ${allQuestions.filter((q) => q.subject === "MATHEMATICS").length}`);
  console.log(`\nOutput: ${combinedFile}`);
}

main().catch(console.error);
