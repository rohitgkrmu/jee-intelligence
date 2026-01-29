"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { MockTestSubject, MockTestQuestion } from "@/lib/mock-test/types";

interface SubjectTabsProps {
  currentSubject: MockTestSubject;
  onSubjectChange: (subject: MockTestSubject) => void;
  questions: {
    physics: MockTestQuestion[];
    chemistry: MockTestQuestion[];
    mathematics: MockTestQuestion[];
  };
  answers: Record<string, { answer: string }>;
  className?: string;
}

const SUBJECTS: { key: MockTestSubject; label: string; shortLabel: string }[] = [
  { key: "physics", label: "Physics", shortLabel: "PHY" },
  { key: "chemistry", label: "Chemistry", shortLabel: "CHM" },
  { key: "mathematics", label: "Mathematics", shortLabel: "MTH" },
];

export function SubjectTabs({
  currentSubject,
  onSubjectChange,
  questions,
  answers,
  className,
}: SubjectTabsProps) {
  const getProgress = (subject: MockTestSubject) => {
    const subjectQuestions = questions[subject];
    const answeredCount = subjectQuestions.filter(
      (q) => answers[q.id]?.answer?.trim()
    ).length;
    return {
      answered: answeredCount,
      total: subjectQuestions.length,
    };
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)]",
        className
      )}
    >
      {SUBJECTS.map((subject) => {
        const isActive = currentSubject === subject.key;
        const progress = getProgress(subject.key);

        return (
          <button
            key={subject.key}
            onClick={() => onSubjectChange(subject.key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 px-4 py-2 rounded-md transition-all",
              isActive
                ? "bg-[var(--zenith-primary)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--background-elevated)] hover:text-[var(--text-primary)]"
            )}
          >
            <span className="font-medium text-sm hidden sm:inline">
              {subject.label}
            </span>
            <span className="font-medium text-sm sm:hidden">
              {subject.shortLabel}
            </span>
            <span
              className={cn(
                "text-xs",
                isActive ? "text-white/80" : "text-[var(--text-muted)]"
              )}
            >
              {progress.answered}/{progress.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
