"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MockTestQuestion, MockTestSubject } from "@/lib/mock-test/types";

interface QuestionPaletteProps {
  questions: MockTestQuestion[];
  answers: Record<string, { answer: string }>;
  visitedQuestions: Set<string>;
  markedForReview: Set<string>;
  currentIndex: number;
  subject: MockTestSubject;
  onQuestionSelect: (index: number) => void;
  className?: string;
}

type QuestionStatus =
  | "not_visited"
  | "visited"
  | "answered"
  | "marked"
  | "answered_marked";

export function QuestionPalette({
  questions,
  answers,
  visitedQuestions,
  markedForReview,
  currentIndex,
  subject,
  onQuestionSelect,
  className,
}: QuestionPaletteProps) {
  const getQuestionStatus = (question: MockTestQuestion): QuestionStatus => {
    const isAnswered = answers[question.id]?.answer?.trim();
    const isVisited = visitedQuestions.has(question.id);
    const isMarked = markedForReview.has(question.id);

    if (isAnswered && isMarked) return "answered_marked";
    if (isMarked) return "marked";
    if (isAnswered) return "answered";
    if (isVisited) return "visited";
    return "not_visited";
  };

  const statusColors: Record<QuestionStatus, string> = {
    not_visited: "bg-gray-600 text-gray-300 hover:bg-gray-500",
    visited: "bg-red-500/80 text-white hover:bg-red-500",
    answered: "bg-green-500/80 text-white hover:bg-green-500",
    marked: "bg-purple-500/80 text-white hover:bg-purple-500",
    answered_marked:
      "bg-purple-500/80 text-white ring-2 ring-green-400 hover:bg-purple-500",
  };

  // Count questions by status
  const counts = React.useMemo(() => {
    const result = {
      not_visited: 0,
      visited: 0,
      answered: 0,
      marked: 0,
      answered_marked: 0,
    };
    for (const q of questions) {
      result[getQuestionStatus(q)]++;
    }
    return result;
  }, [questions, answers, visitedQuestions, markedForReview]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Section A Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Section A (MCQ)
          </span>
          <span className="text-xs text-[var(--text-muted)]">Q1-20</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {questions.slice(0, 20).map((question, index) => {
            const status = getQuestionStatus(question);
            const isCurrent = index === currentIndex;

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(index)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                  statusColors[status],
                  isCurrent && "ring-2 ring-[var(--zenith-cyan)] ring-offset-2 ring-offset-[var(--background-main)]"
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section B Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Section B (Numerical)
          </span>
          <span className="text-xs text-[var(--text-muted)]">Q21-30</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {questions.slice(20, 30).map((question, index) => {
            const actualIndex = index + 20;
            const status = getQuestionStatus(question);
            const isCurrent = actualIndex === currentIndex;

            return (
              <button
                key={question.id}
                onClick={() => onQuestionSelect(actualIndex)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                  statusColors[status],
                  isCurrent && "ring-2 ring-[var(--zenith-cyan)] ring-offset-2 ring-offset-[var(--background-main)]"
                )}
              >
                {actualIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-[var(--border-dark)] pt-4 space-y-2">
        <div className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          Legend
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-600" />
            <span className="text-[var(--text-muted)]">
              Not Visited ({counts.not_visited})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span className="text-[var(--text-muted)]">
              Not Answered ({counts.visited})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-[var(--text-muted)]">
              Answered ({counts.answered})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span className="text-[var(--text-muted)]">
              Marked ({counts.marked})
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="w-4 h-4 rounded bg-purple-500 ring-2 ring-green-400" />
            <span className="text-[var(--text-muted)]">
              Answered & Marked ({counts.answered_marked})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
