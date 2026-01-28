import {
  LeadSchema,
  QuestionSchema,
  DiagnosticItemSchema,
  AnswerSubmissionSchema,
  AdminLoginSchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('LeadSchema', () => {
    const validLead = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      class: '12',
      targetYear: 2025,
      termsAccepted: true,
    };

    it('should validate a correct lead', () => {
      const result = LeadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = LeadSchema.safeParse({ ...validLead, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should reject when terms not accepted', () => {
      const result = LeadSchema.safeParse({ ...validLead, termsAccepted: false });
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const result = LeadSchema.safeParse({ ...validLead, phone: '123' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid class', () => {
      const result = LeadSchema.safeParse({ ...validLead, class: '10' });
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const result = LeadSchema.safeParse({
        ...validLead,
        city: 'Delhi',
        school: 'Test School',
        marketingConsent: true,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('QuestionSchema', () => {
    const validQuestion = {
      datasetSourceId: 'cm1234567890123456789012', // valid cuid format
      examType: 'MAIN',
      examYear: 2024,
      subject: 'PHYSICS',
      chapter: 'Mechanics',
      topic: 'Newton Laws', // Added missing required field
      concept: 'Force',
      questionType: 'MCQ_SINGLE',
      difficulty: 'MEDIUM',
      skills: ['CONCEPTUAL'],
      questionText: 'What is the SI unit of force? This is a longer question text.',
      options: [
        { id: 'A', text: 'Newton' },
        { id: 'B', text: 'Joule' },
        { id: 'C', text: 'Watt' },
        { id: 'D', text: 'Pascal' },
      ],
      correctAnswer: 'A',
    };

    it('should validate a correct question', () => {
      const result = QuestionSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it('should reject invalid exam type', () => {
      const result = QuestionSchema.safeParse({ ...validQuestion, examType: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid subject', () => {
      const result = QuestionSchema.safeParse({ ...validQuestion, subject: 'BIOLOGY' });
      expect(result.success).toBe(false);
    });

    it('should reject exam year before 2000', () => {
      const result = QuestionSchema.safeParse({ ...validQuestion, examYear: 1999 });
      expect(result.success).toBe(false);
    });

    it('should allow empty options array since options is optional', () => {
      const result = QuestionSchema.safeParse({ ...validQuestion, options: [] });
      expect(result.success).toBe(true); // options is optional in schema
    });
  });

  describe('DiagnosticItemSchema', () => {
    const validItem = {
      subject: 'PHYSICS',
      chapter: 'Mechanics',
      concept: 'Force',
      questionType: 'MCQ_SINGLE',
      difficulty: 'MEDIUM',
      skills: ['CONCEPTUAL'],
      questionText: 'What is force? This needs at least 10 characters.',
      options: [
        { id: 'A', text: 'Push or pull' },
        { id: 'B', text: 'Energy' },
      ],
      correctAnswer: 'A',
    };

    it('should validate a correct diagnostic item', () => {
      const result = DiagnosticItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should accept optional hint', () => {
      const result = DiagnosticItemSchema.safeParse({ ...validItem, hint: 'Think about Newton' });
      expect(result.success).toBe(true);
    });

    it('should accept frequencyWeight and priorityScore', () => {
      const result = DiagnosticItemSchema.safeParse({
        ...validItem,
        frequencyWeight: 1.5,
        priorityScore: 2.0,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AnswerSubmissionSchema', () => {
    it('should validate correct answer submission', () => {
      const result = AnswerSubmissionSchema.safeParse({
        itemId: 'cm1234567890123456789012', // valid cuid format
        answer: 'A',
        timeSeconds: 30,
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty answer', () => {
      const result = AnswerSubmissionSchema.safeParse({
        itemId: 'cm1234567890123456789012',
        answer: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept without timeSeconds', () => {
      const result = AnswerSubmissionSchema.safeParse({
        itemId: 'cm1234567890123456789012', // valid cuid format
        answer: 'B',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AdminLoginSchema', () => {
    it('should validate correct login credentials', () => {
      const result = AdminLoginSchema.safeParse({
        email: 'admin@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = AdminLoginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = AdminLoginSchema.safeParse({
        email: 'admin@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });
  });
});
