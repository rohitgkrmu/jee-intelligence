import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Create Dataset Sources
  console.log("Creating dataset sources...");

  const jeeMainSource = await prisma.datasetSource.upsert({
    where: { name: "JEE Main Official 2020-2024" },
    update: {},
    create: {
      name: "JEE Main Official 2020-2024",
      type: "LICENSED",
      description: "Official JEE Main questions from 2020-2024 sessions",
      licenseInfo: "Licensed from official exam archives",
      isActive: true,
    },
  });

  const jeeAdvancedSource = await prisma.datasetSource.upsert({
    where: { name: "JEE Advanced Official 2020-2024" },
    update: {},
    create: {
      name: "JEE Advanced Official 2020-2024",
      type: "LICENSED",
      description: "Official JEE Advanced questions from 2020-2024",
      licenseInfo: "Licensed from official exam archives",
      isActive: true,
    },
  });

  const zenithSource = await prisma.datasetSource.upsert({
    where: { name: "Zenith Custom Questions" },
    update: {},
    create: {
      name: "Zenith Custom Questions",
      type: "OWNED",
      description: "Custom questions authored by Zenith educators",
      isActive: true,
    },
  });

  console.log("Dataset sources created.");

  // Create Admin User
  console.log("Creating admin user...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@zenithschool.ai";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin User",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin user created: ${adminEmail}`);

  // Create Sample Questions
  console.log("Creating sample questions...");

  const sampleQuestions = [
    // Physics
    {
      datasetSourceId: jeeMainSource.id,
      examType: "MAIN",
      examYear: 2024,
      examSession: "January",
      subject: "PHYSICS",
      chapter: "Mechanics",
      topic: "Newton's Laws",
      concept: "Force and Acceleration",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "NUMERICAL"],
      questionText:
        "A block of mass 5 kg is placed on a frictionless surface. A force of 20 N is applied horizontally. What is the acceleration of the block?",
      options: [
        { id: "A", text: "2 m/s²" },
        { id: "B", text: "4 m/s²" },
        { id: "C", text: "5 m/s²" },
        { id: "D", text: "10 m/s²" },
      ],
      correctAnswer: "B",
      solution: "Using F = ma, a = F/m = 20/5 = 4 m/s²",
      tags: ["mechanics", "newton"],
    },
    {
      datasetSourceId: jeeMainSource.id,
      examType: "MAIN",
      examYear: 2023,
      examSession: "April",
      subject: "PHYSICS",
      chapter: "Electromagnetism",
      topic: "Electromagnetic Induction",
      concept: "Faraday's Law",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText:
        "A rectangular coil of 100 turns with area 0.1 m² is placed in a uniform magnetic field of 0.5 T. If the coil rotates at 50 revolutions per second, what is the maximum EMF induced?",
      options: [
        { id: "A", text: "157 V" },
        { id: "B", text: "314 V" },
        { id: "C", text: "628 V" },
        { id: "D", text: "1570 V" },
      ],
      correctAnswer: "D",
      solution:
        "Maximum EMF = NABω = 100 × 0.1 × 0.5 × (2π × 50) = 1570 V",
      tags: ["electromagnetic", "induction"],
    },
    // Chemistry
    {
      datasetSourceId: jeeMainSource.id,
      examType: "MAIN",
      examYear: 2024,
      examSession: "January",
      subject: "CHEMISTRY",
      chapter: "Organic Chemistry",
      topic: "Reaction Mechanisms",
      concept: "SN1 and SN2 Reactions",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText:
        "Which of the following substrates will undergo SN2 reaction fastest?",
      options: [
        { id: "A", text: "Methyl bromide" },
        { id: "B", text: "Ethyl bromide" },
        { id: "C", text: "Isopropyl bromide" },
        { id: "D", text: "tert-Butyl bromide" },
      ],
      correctAnswer: "A",
      solution:
        "SN2 reactions are fastest with methyl halides due to minimal steric hindrance.",
      tags: ["organic", "mechanisms"],
    },
    {
      datasetSourceId: jeeAdvancedSource.id,
      examType: "ADVANCED",
      examYear: 2023,
      subject: "CHEMISTRY",
      chapter: "Physical Chemistry",
      topic: "Thermodynamics",
      concept: "Gibbs Free Energy",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "NUMERICAL"],
      questionText:
        "For a reaction at 300 K, ΔH = -10 kJ/mol and ΔS = -30 J/mol·K. What is the spontaneity of the reaction?",
      options: [
        { id: "A", text: "Spontaneous at all temperatures" },
        { id: "B", text: "Non-spontaneous at all temperatures" },
        { id: "C", text: "Spontaneous at 300 K" },
        { id: "D", text: "Non-spontaneous at 300 K" },
      ],
      correctAnswer: "C",
      solution:
        "ΔG = ΔH - TΔS = -10000 - 300(-30) = -10000 + 9000 = -1000 J/mol. Negative ΔG means spontaneous at 300 K.",
      tags: ["thermodynamics", "gibbs"],
    },
    // Mathematics
    {
      datasetSourceId: jeeMainSource.id,
      examType: "MAIN",
      examYear: 2024,
      examSession: "January",
      subject: "MATHEMATICS",
      chapter: "Calculus",
      topic: "Integration",
      concept: "Definite Integrals",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["NUMERICAL", "APPLICATION"],
      questionText: "Evaluate: ∫₀¹ x·eˣ dx",
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "e - 1" },
        { id: "C", text: "e" },
        { id: "D", text: "2e - 1" },
      ],
      correctAnswer: "A",
      solution:
        "Using integration by parts: ∫x·eˣdx = x·eˣ - eˣ. Evaluating from 0 to 1: (1·e - e) - (0 - 1) = 1",
      tags: ["calculus", "integration"],
    },
    {
      datasetSourceId: jeeAdvancedSource.id,
      examType: "ADVANCED",
      examYear: 2022,
      subject: "MATHEMATICS",
      chapter: "Algebra",
      topic: "Complex Numbers",
      concept: "Roots of Unity",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "ANALYTICAL"],
      questionText:
        "If ω is a primitive cube root of unity, what is the value of (1 + ω)³?",
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "-1" },
        { id: "C", text: "ω" },
        { id: "D", text: "-ω²" },
      ],
      correctAnswer: "B",
      solution:
        "Since 1 + ω + ω² = 0, we have 1 + ω = -ω². Therefore (1 + ω)³ = (-ω²)³ = -ω⁶ = -1",
      tags: ["algebra", "complex"],
    },
  ];

  for (const q of sampleQuestions) {
    await prisma.question.upsert({
      where: {
        id: `${q.subject}-${q.concept}-${q.examYear}`.replace(/\s/g, "-").toLowerCase(),
      },
      update: {},
      create: {
        ...q,
        skills: q.skills as ("CONCEPTUAL" | "NUMERICAL" | "APPLICATION" | "ANALYTICAL" | "DERIVATION" | "GRAPHICAL")[],
        subject: q.subject as "PHYSICS" | "CHEMISTRY" | "MATHEMATICS",
        examType: q.examType as "MAIN" | "ADVANCED",
        questionType: q.questionType as "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER" | "MATCH_THE_COLUMN" | "ASSERTION_REASON" | "COMPREHENSION",
        difficulty: q.difficulty as "EASY" | "MEDIUM" | "HARD",
      },
    });
  }

  console.log(`Created ${sampleQuestions.length} sample questions.`);

  // Create Diagnostic Items
  console.log("Creating diagnostic items...");

  const diagnosticItems = [
    // Physics
    {
      subject: "PHYSICS",
      chapter: "Mechanics",
      concept: "Projectile Motion",
      questionType: "MCQ_SINGLE",
      difficulty: "EASY",
      skills: ["CONCEPTUAL"],
      questionText:
        "A ball is thrown horizontally from a height. What is the shape of its trajectory?",
      options: [
        { id: "A", text: "Straight line" },
        { id: "B", text: "Parabola" },
        { id: "C", text: "Circle" },
        { id: "D", text: "Hyperbola" },
      ],
      correctAnswer: "B",
      solution: "Projectile motion under gravity follows a parabolic path.",
      hint: "Think about the combination of horizontal and vertical motion.",
      frequencyWeight: 1.5,
      priorityScore: 2.0,
    },
    {
      subject: "PHYSICS",
      chapter: "Thermodynamics",
      concept: "First Law",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "NUMERICAL"],
      questionText:
        "In an isothermal process for an ideal gas, what happens to the internal energy?",
      options: [
        { id: "A", text: "Increases" },
        { id: "B", text: "Decreases" },
        { id: "C", text: "Remains constant" },
        { id: "D", text: "Cannot be determined" },
      ],
      correctAnswer: "C",
      solution:
        "For an ideal gas, internal energy depends only on temperature. In isothermal process, T is constant, so U is constant.",
      hint: "What does isothermal mean for temperature?",
      frequencyWeight: 1.8,
      priorityScore: 2.2,
    },
    {
      subject: "PHYSICS",
      chapter: "Optics",
      concept: "Total Internal Reflection",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText:
        "For total internal reflection to occur, light must travel from:",
      options: [
        { id: "A", text: "Denser to rarer medium" },
        { id: "B", text: "Rarer to denser medium" },
        { id: "C", text: "Any medium to any medium" },
        { id: "D", text: "Vacuum to glass" },
      ],
      correctAnswer: "A",
      solution:
        "Total internal reflection occurs when light travels from a denser medium to a rarer medium at an angle greater than the critical angle.",
      frequencyWeight: 1.6,
      priorityScore: 1.8,
    },
    {
      subject: "PHYSICS",
      chapter: "Modern Physics",
      concept: "Photoelectric Effect",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText:
        "In photoelectric effect, increasing the intensity of light increases:",
      options: [
        { id: "A", text: "Maximum kinetic energy of electrons" },
        { id: "B", text: "Number of emitted electrons" },
        { id: "C", text: "Work function" },
        { id: "D", text: "Threshold frequency" },
      ],
      correctAnswer: "B",
      solution:
        "Increasing intensity means more photons, which leads to more electrons being emitted. KE depends on frequency, not intensity.",
      frequencyWeight: 2.0,
      priorityScore: 2.5,
    },
    // Chemistry
    {
      subject: "CHEMISTRY",
      chapter: "Atomic Structure",
      concept: "Quantum Numbers",
      questionType: "MCQ_SINGLE",
      difficulty: "EASY",
      skills: ["CONCEPTUAL"],
      questionText:
        "Which quantum number determines the shape of an orbital?",
      options: [
        { id: "A", text: "Principal (n)" },
        { id: "B", text: "Azimuthal (l)" },
        { id: "C", text: "Magnetic (m)" },
        { id: "D", text: "Spin (s)" },
      ],
      correctAnswer: "B",
      solution:
        "The azimuthal quantum number (l) determines the shape of the orbital (s, p, d, f).",
      frequencyWeight: 1.4,
      priorityScore: 1.6,
    },
    {
      subject: "CHEMISTRY",
      chapter: "Chemical Bonding",
      concept: "VSEPR Theory",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText: "What is the molecular geometry of SF₆?",
      options: [
        { id: "A", text: "Tetrahedral" },
        { id: "B", text: "Square planar" },
        { id: "C", text: "Octahedral" },
        { id: "D", text: "Trigonal bipyramidal" },
      ],
      correctAnswer: "C",
      solution:
        "SF₆ has 6 bonding pairs and no lone pairs on the central S atom, giving it an octahedral geometry.",
      frequencyWeight: 1.7,
      priorityScore: 1.9,
    },
    {
      subject: "CHEMISTRY",
      chapter: "Electrochemistry",
      concept: "Nernst Equation",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["NUMERICAL", "APPLICATION"],
      questionText:
        "At what concentration ratio will a half-cell potential equal its standard potential at 298 K?",
      options: [
        { id: "A", text: "1:1" },
        { id: "B", text: "2:1" },
        { id: "C", text: "10:1" },
        { id: "D", text: "Any ratio" },
      ],
      correctAnswer: "A",
      solution:
        "When the ratio is 1:1, log(1) = 0, so E = E°. The Nernst equation term becomes zero.",
      hint: "What happens to log when the argument is 1?",
      frequencyWeight: 1.5,
      priorityScore: 1.8,
    },
    {
      subject: "CHEMISTRY",
      chapter: "Organic Chemistry",
      concept: "Aromatic Compounds",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText:
        "Which of the following is NOT aromatic according to Huckel's rule?",
      options: [
        { id: "A", text: "Benzene" },
        { id: "B", text: "Cyclopentadienyl anion" },
        { id: "C", text: "Cyclooctatetraene" },
        { id: "D", text: "Tropylium cation" },
      ],
      correctAnswer: "C",
      solution:
        "Cyclooctatetraene has 8 π electrons, not satisfying 4n+2 rule. It's non-planar and anti-aromatic if planar.",
      frequencyWeight: 1.9,
      priorityScore: 2.3,
    },
    // Mathematics
    {
      subject: "MATHEMATICS",
      chapter: "Trigonometry",
      concept: "Trigonometric Identities",
      questionType: "MCQ_SINGLE",
      difficulty: "EASY",
      skills: ["CONCEPTUAL"],
      questionText: "What is the value of sin²θ + cos²θ?",
      options: [
        { id: "A", text: "0" },
        { id: "B", text: "1" },
        { id: "C", text: "2" },
        { id: "D", text: "Depends on θ" },
      ],
      correctAnswer: "B",
      solution:
        "This is a fundamental Pythagorean identity: sin²θ + cos²θ = 1 for all values of θ.",
      frequencyWeight: 1.2,
      priorityScore: 1.4,
    },
    {
      subject: "MATHEMATICS",
      chapter: "Calculus",
      concept: "Differentiation",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["NUMERICAL"],
      questionText: "What is the derivative of eˣ·sin(x)?",
      options: [
        { id: "A", text: "eˣ·sin(x)" },
        { id: "B", text: "eˣ·cos(x)" },
        { id: "C", text: "eˣ(sin(x) + cos(x))" },
        { id: "D", text: "eˣ(sin(x) - cos(x))" },
      ],
      correctAnswer: "C",
      solution:
        "Using product rule: d/dx[eˣ·sin(x)] = eˣ·sin(x) + eˣ·cos(x) = eˣ(sin(x) + cos(x))",
      frequencyWeight: 1.6,
      priorityScore: 2.0,
    },
    {
      subject: "MATHEMATICS",
      chapter: "Coordinate Geometry",
      concept: "Conic Sections",
      questionType: "MCQ_SINGLE",
      difficulty: "MEDIUM",
      skills: ["CONCEPTUAL", "APPLICATION"],
      questionText: "The eccentricity of a parabola is:",
      options: [
        { id: "A", text: "0" },
        { id: "B", text: "1" },
        { id: "C", text: "Greater than 1" },
        { id: "D", text: "Between 0 and 1" },
      ],
      correctAnswer: "B",
      solution:
        "A parabola has eccentricity exactly equal to 1. For ellipse e<1, for hyperbola e>1.",
      frequencyWeight: 1.5,
      priorityScore: 1.7,
    },
    {
      subject: "MATHEMATICS",
      chapter: "Probability",
      concept: "Conditional Probability",
      questionType: "MCQ_SINGLE",
      difficulty: "HARD",
      skills: ["CONCEPTUAL", "NUMERICAL"],
      questionText:
        "If P(A) = 0.3, P(B) = 0.4, and P(A∩B) = 0.1, what is P(A|B)?",
      options: [
        { id: "A", text: "0.25" },
        { id: "B", text: "0.33" },
        { id: "C", text: "0.40" },
        { id: "D", text: "0.75" },
      ],
      correctAnswer: "A",
      solution: "P(A|B) = P(A∩B)/P(B) = 0.1/0.4 = 0.25",
      hint: "Conditional probability formula: P(A|B) = P(A∩B)/P(B)",
      frequencyWeight: 1.8,
      priorityScore: 2.1,
    },
  ];

  for (const item of diagnosticItems) {
    await prisma.diagnosticItem.create({
      data: {
        ...item,
        skills: item.skills as ("CONCEPTUAL" | "NUMERICAL" | "APPLICATION" | "ANALYTICAL" | "DERIVATION" | "GRAPHICAL")[],
        subject: item.subject as "PHYSICS" | "CHEMISTRY" | "MATHEMATICS",
        questionType: item.questionType as "MCQ_SINGLE" | "MCQ_MULTIPLE" | "NUMERICAL" | "INTEGER" | "MATCH_THE_COLUMN" | "ASSERTION_REASON" | "COMPREHENSION",
        difficulty: item.difficulty as "EASY" | "MEDIUM" | "HARD",
      },
    });
  }

  console.log(`Created ${diagnosticItems.length} diagnostic items.`);

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
