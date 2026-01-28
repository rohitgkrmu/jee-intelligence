import { z } from "zod";

// Enums matching Prisma schema
export const ExamType = z.enum(["MAIN", "ADVANCED"]);
export const Subject = z.enum(["PHYSICS", "CHEMISTRY", "MATHEMATICS"]);
export const QuestionType = z.enum([
  "MCQ_SINGLE",
  "MCQ_MULTIPLE",
  "NUMERICAL",
  "INTEGER",
  "MATCH_THE_COLUMN",
  "ASSERTION_REASON",
  "COMPREHENSION",
]);
export const Difficulty = z.enum(["EASY", "MEDIUM", "HARD"]);
export const Skill = z.enum([
  "CONCEPTUAL",
  "NUMERICAL",
  "APPLICATION",
  "ANALYTICAL",
  "DERIVATION",
  "GRAPHICAL",
]);
export const AdminRole = z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR", "VIEWER"]);
export const DatasetType = z.enum(["LICENSED", "OWNED", "PUBLIC"]);

// Lead schema
export const LeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
    .optional()
    .or(z.literal("")),
  class: z.enum(["11", "12", "Dropper"]).optional(),
  targetYear: z.number().int().min(2024).max(2030).optional(),
  city: z.string().max(100).optional(),
  school: z.string().max(200).optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  marketingConsent: z.boolean().optional().default(false),
  whatsappConsent: z.boolean().optional().default(false),
});

export type LeadInput = z.infer<typeof LeadSchema>;

// Question schema
export const QuestionSchema = z.object({
  datasetSourceId: z.string().cuid(),
  examType: ExamType,
  examYear: z.number().int().min(2000).max(2030),
  examSession: z.string().max(50).optional(),
  subject: Subject,
  chapter: z.string().min(1).max(200),
  topic: z.string().min(1).max(200),
  concept: z.string().min(1).max(200),
  questionType: QuestionType,
  difficulty: Difficulty,
  skills: z.array(Skill).min(1),
  questionText: z.string().min(10),
  options: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .optional(),
  correctAnswer: z.string().min(1),
  solution: z.string().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

export type QuestionInput = z.infer<typeof QuestionSchema>;

// Diagnostic Item schema
export const DiagnosticItemSchema = z.object({
  subject: Subject,
  chapter: z.string().min(1).max(200),
  concept: z.string().min(1).max(200),
  questionType: QuestionType,
  difficulty: Difficulty,
  skills: z.array(Skill).min(1),
  questionText: z.string().min(10),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
  correctAnswer: z.string().min(1),
  solution: z.string().optional(),
  hint: z.string().optional(),
  frequencyWeight: z.number().min(0).max(10).default(1.0),
  priorityScore: z.number().min(0).max(10).default(1.0),
  isActive: z.boolean().default(true),
});

export type DiagnosticItemInput = z.infer<typeof DiagnosticItemSchema>;

// Answer submission schema
export const AnswerSubmissionSchema = z.object({
  itemId: z.string().cuid(),
  answer: z.string().min(1),
  timeSeconds: z.number().int().min(0).optional(),
});

export type AnswerSubmission = z.infer<typeof AnswerSubmissionSchema>;

// Admin login schema
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;

// Admin user schema
export const AdminUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2).max(100),
  role: AdminRole.default("EDITOR"),
  isActive: z.boolean().default(true),
});

export type AdminUserInput = z.infer<typeof AdminUserSchema>;

// Dataset source schema
export const DatasetSourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: DatasetType,
  description: z.string().optional(),
  licenseInfo: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type DatasetSourceInput = z.infer<typeof DatasetSourceSchema>;

// Import field mapping schema
export const ImportMappingSchema = z.object({
  datasetSourceId: z.string().cuid(),
  fieldMappings: z.record(z.string(), z.string()),
  defaultValues: z.record(z.string(), z.unknown()).optional(),
});

export type ImportMappingInput = z.infer<typeof ImportMappingSchema>;

// Insights filter schema
export const InsightsFilterSchema = z.object({
  examType: ExamType.optional(),
  subjects: z.array(Subject).optional(),
  yearStart: z.number().int().min(2000).max(2030).optional(),
  yearEnd: z.number().int().min(2000).max(2030).optional(),
  chapters: z.array(z.string()).optional(),
});

export type InsightsFilter = z.infer<typeof InsightsFilterSchema>;

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
