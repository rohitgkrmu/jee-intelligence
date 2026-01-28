"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, Clock, ChevronRight, SkipForward, CheckCircle, XCircle } from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  subject: string;
  chapter: string;
  questionType: string;
  difficulty: string;
  questionText: string;
  options: QuestionOption[];
  hint?: string;
}

interface QuizState {
  status: "IN_PROGRESS" | "COMPLETED";
  currentIndex: number;
  totalQuestions: number;
  question?: Question;
  reportToken?: string;
}

interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  solution?: string;
  nextIndex: number | null;
  isComplete: boolean;
  reportToken?: string;
}

export function DiagnosticQuiz({ attemptId }: { attemptId: string }) {
  const router = useRouter();
  const [state, setState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Fetch current question
  useEffect(() => {
    async function fetchQuestion() {
      try {
        const response = await fetch(`/api/diagnostic/${attemptId}`);
        const data = await response.json();

        if (data.status === "COMPLETED") {
          router.push(`/report/${data.reportToken}`);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch question");
        }

        setState(data);
        setStartTime(Date.now());
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestion();
  }, [attemptId, router]);

  const handleAnswer = async (answer: string) => {
    if (submitting || answerResult) return;

    setSelectedAnswer(answer);
    setSubmitting(true);

    try {
      const timeSeconds = Math.round((Date.now() - startTime) / 1000);

      const response = await fetch(`/api/diagnostic/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: state?.question?.id,
          answer,
          timeSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit answer");
      }

      setAnswerResult(data);
      setShowSolution(true);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`/api/diagnostic/${attemptId}/skip`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to skip question");
      }

      if (data.isComplete) {
        router.push(`/report/${data.reportToken}`);
      } else {
        // Refresh to get next question
        window.location.reload();
      }
    } catch (error) {
      console.error("Error skipping question:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (answerResult?.isComplete) {
      router.push(`/report/${answerResult.reportToken}`);
    } else {
      // Refresh to get next question
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
      </div>
    );
  }

  if (!state || !state.question) {
    return (
      <div className="container mx-auto px-4 text-center py-20">
        <p className="text-[var(--text-muted)]">
          Unable to load quiz. Please try again.
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => router.push("/diagnostic")}
        >
          Start Over
        </Button>
      </div>
    );
  }

  const { question, currentIndex, totalQuestions } = state;
  const progress = ((currentIndex) / totalQuestions) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HARD":
        return "error";
      default:
        return "secondary";
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return "cyan";
      case "CHEMISTRY":
        return "purple";
      case "MATHEMATICS":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-2xl">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Clock className="w-4 h-4" />
            <span>Take your time</span>
          </div>
        </div>
        <Progress value={progress} variant="gradient" size="sm" />
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant={getSubjectColor(question.subject) as "default" | "cyan" | "purple" | "secondary"}>
              {question.subject}
            </Badge>
            <Badge variant={getDifficultyColor(question.difficulty) as "success" | "warning" | "error" | "secondary"}>
              {question.difficulty}
            </Badge>
            <Badge variant="outline">{question.chapter}</Badge>
          </div>

          {/* Question Text */}
          <div className="mb-6">
            <p className="text-lg leading-relaxed">{question.questionText}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isCorrect =
                answerResult && option.id === answerResult.correctAnswer;
              const isWrong =
                answerResult && isSelected && !answerResult.isCorrect;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  disabled={!!answerResult || submitting}
                  className={cn(
                    "w-full p-4 rounded-lg border text-left transition-all",
                    "hover:border-[var(--zenith-cyan)] hover:bg-[var(--zenith-cyan)]/5",
                    "disabled:cursor-not-allowed",
                    isSelected &&
                      !answerResult &&
                      "border-[var(--zenith-cyan)] bg-[var(--zenith-cyan)]/10",
                    isCorrect &&
                      "border-green-500 bg-green-500/10 text-green-400",
                    isWrong && "border-red-500 bg-red-500/10 text-red-400",
                    !isSelected &&
                      !isCorrect &&
                      answerResult &&
                      "opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                        isCorrect && "bg-green-500 text-white",
                        isWrong && "bg-red-500 text-white",
                        !isCorrect &&
                          !isWrong &&
                          "bg-[var(--background-elevated)] text-[var(--text-secondary)]"
                      )}
                    >
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isWrong ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        option.id
                      )}
                    </span>
                    <span className="pt-1">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Solution (shown after answer) */}
      {showSolution && answerResult?.solution && (
        <Card className="mb-6 border-[var(--zenith-cyan)]/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-[var(--zenith-cyan)] mb-2">
              Solution
            </h3>
            <p className="text-[var(--text-secondary)]">{answerResult.solution}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {!answerResult ? (
          <>
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={submitting}
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Skip Question
            </Button>
            {submitting && (
              <Loader2 className="w-5 h-5 animate-spin text-[var(--zenith-cyan)]" />
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {answerResult.isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span
                className={cn(
                  "font-medium",
                  answerResult.isCorrect ? "text-green-400" : "text-red-400"
                )}
              >
                {answerResult.isCorrect ? "Correct!" : "Incorrect"}
              </span>
            </div>
            <Button variant="gradient" onClick={handleNext}>
              {answerResult.isComplete ? "View Report" : "Next Question"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}
      </div>

      {/* Hint (optional) */}
      {question.hint && !answerResult && (
        <p className="mt-6 text-sm text-[var(--text-muted)] text-center">
          Hint: {question.hint}
        </p>
      )}
    </div>
  );
}
