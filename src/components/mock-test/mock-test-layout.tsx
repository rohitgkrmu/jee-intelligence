"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Timer } from "./timer";
import { SubjectTabs } from "./subject-tabs";
import { QuestionPalette } from "./question-palette";
import { QuestionView } from "./question-view";
import { ConfirmSubmitModal } from "./confirm-submit-modal";
import { Menu, X } from "lucide-react";
import type { MockTestQuestion, MockTestSubject } from "@/lib/mock-test/types";

interface MockTestLayoutProps {
  mockTestName: string;
  startedAt: Date;
  duration: number;
  questions: {
    physics: MockTestQuestion[];
    chemistry: MockTestQuestion[];
    mathematics: MockTestQuestion[];
  };
  answers: Record<string, { answer: string; timeSpent: number }>;
  visitedQuestions: Set<string>;
  markedForReview: Set<string>;
  currentSubject: MockTestSubject;
  currentIndex: number;
  onSubjectChange: (subject: MockTestSubject) => void;
  onQuestionSelect: (index: number) => void;
  onAnswerChange: (questionId: string, answer: string) => void;
  onMarkToggle: (questionId: string) => void;
  onClear: (questionId: string) => void;
  onSubmit: () => Promise<void>;
  onTimeUp: () => void;
}

export function MockTestLayout({
  mockTestName,
  startedAt,
  duration,
  questions,
  answers,
  visitedQuestions,
  markedForReview,
  currentSubject,
  currentIndex,
  onSubjectChange,
  onQuestionSelect,
  onAnswerChange,
  onMarkToggle,
  onClear,
  onSubmit,
  onTimeUp,
}: MockTestLayoutProps) {
  const [showPalette, setShowPalette] = React.useState(false);
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(() => {
    const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(0, duration - elapsed);
  });

  // Update time remaining for modal
  React.useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      setTimeRemaining(Math.max(0, duration - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, duration]);

  const currentQuestions = questions[currentSubject];
  const currentQuestion = currentQuestions[currentIndex];

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const totalQuestions = Object.values(questions).reduce(
    (sum, q) => sum + q.length,
    0
  );

  const answeredCount = Object.values(answers).filter(
    (a) => a.answer?.trim()
  ).length;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onQuestionSelect(currentIndex - 1);
    } else if (currentSubject !== "physics") {
      // Go to previous subject
      const subjects: MockTestSubject[] = ["physics", "chemistry", "mathematics"];
      const currentSubjectIndex = subjects.indexOf(currentSubject);
      const prevSubject = subjects[currentSubjectIndex - 1];
      onSubjectChange(prevSubject);
      onQuestionSelect(questions[prevSubject].length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      onQuestionSelect(currentIndex + 1);
    } else if (currentSubject !== "mathematics") {
      // Go to next subject
      const subjects: MockTestSubject[] = ["physics", "chemistry", "mathematics"];
      const currentSubjectIndex = subjects.indexOf(currentSubject);
      const nextSubject = subjects[currentSubjectIndex + 1];
      onSubjectChange(nextSubject);
      onQuestionSelect(0);
    }
  };

  const handleSaveAndNext = () => {
    // Answer is auto-saved, just move to next
    handleNext();
  };

  const handleSubmitClick = () => {
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const stats = {
    answered: answeredCount,
    unanswered: totalQuestions - answeredCount,
    marked: markedForReview.size,
    total: totalQuestions,
  };

  return (
    <div className="min-h-screen bg-[var(--background-main)] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background-card)] border-b border-[var(--border-dark)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {mockTestName}
            </h1>
            <div className="flex items-center gap-3">
              <Timer
                startedAt={startedAt}
                duration={duration}
                onTimeUp={onTimeUp}
              />
              <Button
                variant="gradient"
                onClick={handleSubmitClick}
                className="hidden sm:flex"
              >
                Submit Test
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPalette(!showPalette)}
                className="lg:hidden"
              >
                {showPalette ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Subject Tabs */}
      <div className="sticky top-[73px] z-30 bg-[var(--background-main)] border-b border-[var(--border-dark)] py-3">
        <div className="container mx-auto px-4">
          <SubjectTabs
            currentSubject={currentSubject}
            onSubjectChange={onSubjectChange}
            questions={questions}
            answers={answers}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6 h-full">
          {/* Question View */}
          <div className="flex-1 min-w-0">
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border-dark)] p-6 h-full">
              <QuestionView
                question={currentQuestion}
                questionIndex={currentIndex}
                totalQuestions={currentQuestions.length}
                answer={answers[currentQuestion.id]?.answer || ""}
                isMarked={markedForReview.has(currentQuestion.id)}
                onAnswerChange={(answer) =>
                  onAnswerChange(currentQuestion.id, answer)
                }
                onMarkToggle={() => onMarkToggle(currentQuestion.id)}
                onClear={() => onClear(currentQuestion.id)}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSaveAndNext={handleSaveAndNext}
              />
            </div>
          </div>

          {/* Question Palette - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-[145px] bg-[var(--background-card)] rounded-xl border border-[var(--border-dark)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Questions
                </h3>
                <span className="text-sm text-[var(--text-muted)]">
                  {currentSubject.charAt(0).toUpperCase() +
                    currentSubject.slice(1)}
                </span>
              </div>
              <QuestionPalette
                questions={currentQuestions}
                answers={answers}
                visitedQuestions={visitedQuestions}
                markedForReview={markedForReview}
                currentIndex={currentIndex}
                subject={currentSubject}
                onQuestionSelect={onQuestionSelect}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submit Button */}
      <div className="sm:hidden sticky bottom-0 bg-[var(--background-card)] border-t border-[var(--border-dark)] p-4">
        <Button
          variant="gradient"
          onClick={handleSubmitClick}
          className="w-full"
        >
          Submit Test ({answeredCount}/{totalQuestions} answered)
        </Button>
      </div>

      {/* Mobile Palette Drawer */}
      {showPalette && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowPalette(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[var(--background-card)] p-4 overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">
                Questions -{" "}
                {currentSubject.charAt(0).toUpperCase() +
                  currentSubject.slice(1)}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPalette(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <QuestionPalette
              questions={currentQuestions}
              answers={answers}
              visitedQuestions={visitedQuestions}
              markedForReview={markedForReview}
              currentIndex={currentIndex}
              subject={currentSubject}
              onQuestionSelect={(index) => {
                onQuestionSelect(index);
                setShowPalette(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <ConfirmSubmitModal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        stats={stats}
        timeRemaining={timeRemaining}
        loading={submitting}
      />
    </div>
  );
}
