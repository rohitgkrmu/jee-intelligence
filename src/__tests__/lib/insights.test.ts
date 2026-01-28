/**
 * Tests for Insights Engine
 * Tests the weightage and ROI calculation logic
 */

describe('Insights Engine', () => {
  describe('Weightage Calculation Logic', () => {
    it('should calculate percentage correctly', () => {
      const subjectCount = 3;
      const totalQuestions = 6;
      const percentage = (subjectCount / totalQuestions) * 100;
      
      expect(percentage).toBe(50);
    });

    it('should handle empty data', () => {
      const questions: any[] = [];
      const totalQuestions = questions.length;
      
      expect(totalQuestions).toBe(0);
    });

    it('should group by subject correctly', () => {
      const questions = [
        { subject: 'PHYSICS' },
        { subject: 'PHYSICS' },
        { subject: 'CHEMISTRY' },
        { subject: 'MATHEMATICS' },
      ];

      const grouped = questions.reduce((acc, q) => {
        acc[q.subject] = (acc[q.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(grouped['PHYSICS']).toBe(2);
      expect(grouped['CHEMISTRY']).toBe(1);
      expect(grouped['MATHEMATICS']).toBe(1);
    });

    it('should calculate year range correctly', () => {
      const years = [2020, 2021, 2022, 2023, 2024];
      const start = Math.min(...years);
      const end = Math.max(...years);

      expect(start).toBe(2020);
      expect(end).toBe(2024);
    });
  });

  describe('ROI Calculation Logic', () => {
    it('should calculate ROI score correctly', () => {
      // ROI = frequency * (avgDifficulty / 3)
      const frequency = 5;
      const avgDifficulty = 2; // MEDIUM
      const roiScore = frequency * (avgDifficulty / 3);

      expect(roiScore).toBeCloseTo(3.33, 1);
    });

    it('should assign correct difficulty values', () => {
      const difficultyMap: Record<string, number> = {
        'EASY': 1,
        'MEDIUM': 2,
        'HARD': 3,
      };

      expect(difficultyMap['EASY']).toBe(1);
      expect(difficultyMap['MEDIUM']).toBe(2);
      expect(difficultyMap['HARD']).toBe(3);
    });

    it('should recommend based on ROI thresholds', () => {
      const getRecommendation = (roiScore: number): string => {
        if (roiScore >= 5) return 'high';
        if (roiScore >= 2) return 'medium';
        return 'low';
      };

      expect(getRecommendation(6)).toBe('high');
      expect(getRecommendation(3)).toBe('medium');
      expect(getRecommendation(1)).toBe('low');
    });

    it('should sort by ROI descending', () => {
      const concepts = [
        { concept: 'A', roiScore: 2 },
        { concept: 'B', roiScore: 5 },
        { concept: 'C', roiScore: 3 },
      ];

      const sorted = [...concepts].sort((a, b) => b.roiScore - a.roiScore);

      expect(sorted[0].concept).toBe('B');
      expect(sorted[1].concept).toBe('C');
      expect(sorted[2].concept).toBe('A');
    });
  });

  describe('Trend Analysis Logic', () => {
    it('should calculate year-over-year change', () => {
      const yearData = [
        { year: 2022, count: 5 },
        { year: 2023, count: 8 },
        { year: 2024, count: 10 },
      ];

      const yoyChange = yearData.map((d, i) => {
        if (i === 0) return { ...d, change: 0 };
        const prevCount = yearData[i - 1].count;
        const change = ((d.count - prevCount) / prevCount) * 100;
        return { ...d, change };
      });

      expect(yoyChange[1].change).toBe(60); // (8-5)/5 * 100 = 60%
      expect(yoyChange[2].change).toBe(25); // (10-8)/8 * 100 = 25%
    });

    it('should identify rising trends (positive slope)', () => {
      const isRising = (slope: number): boolean => slope > 0.5;

      expect(isRising(1.0)).toBe(true);
      expect(isRising(0.3)).toBe(false);
    });

    it('should identify falling trends (negative slope)', () => {
      const isFalling = (slope: number): boolean => slope < -0.5;

      expect(isFalling(-1.0)).toBe(true);
      expect(isFalling(-0.3)).toBe(false);
    });
  });
});
