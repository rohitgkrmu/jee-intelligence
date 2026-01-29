import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getMockTestQuestions } from "@/lib/mock-test";
import { MockTestClient } from "./mock-test-client";

interface Props {
  params: Promise<{ attemptId: string }>;
}

export default async function MockTestAttemptPage({ params }: Props) {
  const { attemptId } = await params;

  const attempt = await prisma.mockTestAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mockTest: true,
    },
  });

  if (!attempt) {
    notFound();
  }

  // Check if already completed
  if (attempt.status === "COMPLETED") {
    // Redirect to report
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Already Completed</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            This test has already been submitted.
          </p>
          <a
            href={`/mock-test-report/${attempt.reportToken}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--zenith-primary)] text-white font-medium hover:bg-[var(--zenith-primary-dark)] transition-colors"
          >
            View Your Report
          </a>
        </div>
      </div>
    );
  }

  if (attempt.status === "ABANDONED") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Test Abandoned</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            This test attempt has been abandoned.
          </p>
          <a
            href="/mock-test"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--zenith-primary)] text-white font-medium hover:bg-[var(--zenith-primary-dark)] transition-colors"
          >
            Start New Test
          </a>
        </div>
      </div>
    );
  }

  // Get full question details
  const questions = await getMockTestQuestions({
    physics: attempt.physicsQuestions,
    chemistry: attempt.chemistryQuestions,
    mathematics: attempt.mathQuestions,
  });

  // Remove correct answers and solutions for client
  const sanitizedQuestions = {
    physics: questions.physics.map((q) => ({
      ...q,
      correctAnswer: "",
      solution: null,
    })),
    chemistry: questions.chemistry.map((q) => ({
      ...q,
      correctAnswer: "",
      solution: null,
    })),
    mathematics: questions.mathematics.map((q) => ({
      ...q,
      correctAnswer: "",
      solution: null,
    })),
  };

  // Parse saved answers
  const savedAnswers =
    (attempt.answers as Record<
      string,
      { answer: string; timeSpent: number }
    >) || {};

  return (
    <MockTestClient
      attemptId={attempt.id}
      mockTestName={attempt.mockTest.name}
      startedAt={attempt.startedAt.toISOString()}
      duration={attempt.mockTest.duration}
      questions={sanitizedQuestions}
      initialAnswers={savedAnswers}
      initialVisited={attempt.visitedQuestions}
      initialMarked={attempt.markedForReview}
    />
  );
}
