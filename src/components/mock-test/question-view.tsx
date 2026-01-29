"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck, Eraser, ChevronLeft, ChevronRight } from "lucide-react";
import type { MockTestQuestion } from "@/lib/mock-test/types";

interface QuestionViewProps {
  question: MockTestQuestion;
  questionIndex: number;
  totalQuestions: number;
  answer: string;
  isMarked: boolean;
  onAnswerChange: (answer: string) => void;
  onMarkToggle: () => void;
  onClear: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSaveAndNext: () => void;
  className?: string;
}

export function QuestionView({
  question,
  questionIndex,
  totalQuestions,
  answer,
  isMarked,
  onAnswerChange,
  onMarkToggle,
  onClear,
  onPrevious,
  onNext,
  onSaveAndNext,
  className,
}: QuestionViewProps) {
  const isNumerical =
    question.questionType === "NUMERICAL" ||
    question.questionType === "INTEGER";

  const getDifficultyBadge = () => {
    switch (question.difficulty) {
      case "EASY":
        return <Badge variant="success">Easy</Badge>;
      case "MEDIUM":
        return <Badge variant="warning">Medium</Badge>;
      case "HARD":
        return <Badge variant="error">Hard</Badge>;
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Question Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[var(--border-dark)]">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-[var(--text-primary)]">
            Q.{questionIndex + 1}
          </span>
          <Badge variant="secondary">
            Section {question.sectionType}
          </Badge>
          {getDifficultyBadge()}
          <Badge variant="outline">{question.chapter}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">
            {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="flex-1 overflow-y-auto py-6">
        <div
          className="prose prose-invert max-w-none text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: question.questionText }}
        />

        {/* Options or Numerical Input */}
        <div className="mt-8 space-y-3">
          {isNumerical ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                Enter your answer (numerical value):
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Enter numerical answer..."
                className={cn(
                  "w-full max-w-xs px-4 py-3 rounded-lg text-lg font-mono",
                  "bg-[var(--background-elevated)] border border-[var(--border-dark)]",
                  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--zenith-cyan)] focus:border-transparent"
                )}
              />
              <p className="text-xs text-[var(--text-muted)]">
                {question.questionType === "INTEGER"
                  ? "Enter an integer value"
                  : "Enter a decimal value (up to 2 decimal places)"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((option) => {
                const isSelected = answer === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => onAnswerChange(option.id)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-lg border text-left transition-all",
                      isSelected
                        ? "bg-[var(--zenith-primary)]/10 border-[var(--zenith-primary)] text-[var(--text-primary)]"
                        : "bg-[var(--background-card)] border-[var(--border-dark)] text-[var(--text-secondary)] hover:border-[var(--border-light)] hover:bg-[var(--background-elevated)]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                        isSelected
                          ? "bg-[var(--zenith-primary)] text-white"
                          : "bg-[var(--background-elevated)] text-[var(--text-muted)]"
                      )}
                    >
                      {option.id}
                    </span>
                    <span
                      className="flex-1 pt-1"
                      dangerouslySetInnerHTML={{ __html: option.text }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border-dark)]">
        <div className="flex items-center gap-2">
          <Button
            variant={isMarked ? "accent" : "outline"}
            onClick={onMarkToggle}
            className="gap-2"
          >
            {isMarked ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isMarked ? "Marked" : "Mark for Review"}
            </span>
          </Button>
          <Button variant="ghost" onClick={onClear} disabled={!answer}>
            <Eraser className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Clear</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={questionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          {questionIndex < totalQuestions - 1 ? (
            <>
              <Button variant="outline" onClick={onNext}>
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="primary" onClick={onSaveAndNext}>
                Save & Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="gradient" onClick={onSaveAndNext}>
              Save
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
