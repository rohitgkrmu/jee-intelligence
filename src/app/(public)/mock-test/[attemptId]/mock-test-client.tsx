"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { MockTestLayout } from "@/components/mock-test";
import type { MockTestQuestion, MockTestSubject } from "@/lib/mock-test/types";
import { TIMER } from "@/lib/mock-test/types";

interface Props {
  attemptId: string;
  mockTestName: string;
  startedAt: string;
  duration: number;
  questions: {
    physics: MockTestQuestion[];
    chemistry: MockTestQuestion[];
    mathematics: MockTestQuestion[];
  };
  initialAnswers: Record<string, { answer: string; timeSpent: number }>;
  initialVisited: string[];
  initialMarked: string[];
}

export function MockTestClient({
  attemptId,
  mockTestName,
  startedAt,
  duration,
  questions,
  initialAnswers,
  initialVisited,
  initialMarked,
}: Props) {
  const router = useRouter();
  const [currentSubject, setCurrentSubject] = useState<MockTestSubject>("physics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { answer: string; timeSpent: number }>
  >(initialAnswers);
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(
    new Set(initialVisited)
  );
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    new Set(initialMarked)
  );

  // Track time spent on current question
  const questionStartTimeRef = useRef<number>(Date.now());
  const lastSaveRef = useRef<number>(Date.now());

  // Mark current question as visited
  useEffect(() => {
    const currentQuestion = questions[currentSubject][currentIndex];
    if (currentQuestion) {
      setVisitedQuestions((prev) => {
        const next = new Set(prev);
        next.add(currentQuestion.id);
        return next;
      });
      questionStartTimeRef.current = Date.now();
    }
  }, [currentSubject, currentIndex, questions]);

  // Auto-save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      autosave();
    }, TIMER.AUTOSAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [answers, visitedQuestions, markedForReview, currentSubject, currentIndex]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      autosave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [answers, visitedQuestions, markedForReview]);

  const autosave = useCallback(async () => {
    // Don't save too frequently
    if (Date.now() - lastSaveRef.current < 5000) return;
    lastSaveRef.current = Date.now();

    try {
      await fetch(`/api/mock-test/${attemptId}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          visitedQuestions: Array.from(visitedQuestions),
          markedForReview: Array.from(markedForReview),
          currentSubject,
          currentIndex,
        }),
      });
    } catch (error) {
      console.error("Autosave failed:", error);
    }
  }, [attemptId, answers, visitedQuestions, markedForReview, currentSubject, currentIndex]);

  const handleSubjectChange = (subject: MockTestSubject) => {
    // Save time spent on current question before switching
    updateCurrentQuestionTime();
    setCurrentSubject(subject);
    setCurrentIndex(0);
  };

  const handleQuestionSelect = (index: number) => {
    updateCurrentQuestionTime();
    setCurrentIndex(index);
  };

  const updateCurrentQuestionTime = () => {
    const currentQuestion = questions[currentSubject][currentIndex];
    if (currentQuestion) {
      const timeSpent = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000
      );
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          answer: prev[currentQuestion.id]?.answer || "",
          timeSpent: (prev[currentQuestion.id]?.timeSpent || 0) + timeSpent,
        },
      }));
    }
  };

  const handleAnswerChange = async (questionId: string, answer: string) => {
    const timeSpent = Math.floor(
      (Date.now() - questionStartTimeRef.current) / 1000
    );
    questionStartTimeRef.current = Date.now();

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer,
        timeSpent: (prev[questionId]?.timeSpent || 0) + timeSpent,
      },
    }));

    // Save immediately
    try {
      await fetch(`/api/mock-test/${attemptId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          answer,
          timeSpent,
        }),
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleMarkToggle = (questionId: string) => {
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleClear = (questionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        answer: "",
      },
    }));
  };

  const handleSubmit = async () => {
    updateCurrentQuestionTime();

    try {
      const response = await fetch(`/api/mock-test/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok && data.reportToken) {
        router.push(`/mock-test-report/${data.reportToken}`);
      } else {
        console.error("Submit failed:", data.error);
        alert("Failed to submit test. Please try again.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  const handleTimeUp = async () => {
    // Auto-submit when time is up
    await handleSubmit();
  };

  return (
    <MockTestLayout
      mockTestName={mockTestName}
      startedAt={new Date(startedAt)}
      duration={duration}
      questions={questions}
      answers={answers}
      visitedQuestions={visitedQuestions}
      markedForReview={markedForReview}
      currentSubject={currentSubject}
      currentIndex={currentIndex}
      onSubjectChange={handleSubjectChange}
      onQuestionSelect={handleQuestionSelect}
      onAnswerChange={handleAnswerChange}
      onMarkToggle={handleMarkToggle}
      onClear={handleClear}
      onSubmit={handleSubmit}
      onTimeUp={handleTimeUp}
    />
  );
}
