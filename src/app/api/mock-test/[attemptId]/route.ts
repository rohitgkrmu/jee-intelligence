import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMockTestQuestions } from "@/lib/mock-test";
import { TIMER } from "@/lib/mock-test/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: {
        mockTest: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Check if test has expired
    const elapsed = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );
    const timeRemaining = Math.max(0, attempt.mockTest.duration - elapsed);

    if (attempt.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        reportToken: attempt.reportToken,
      });
    }

    if (attempt.status === "ABANDONED") {
      return NextResponse.json(
        { error: "This attempt has been abandoned" },
        { status: 410 }
      );
    }

    // Auto-complete if time has expired
    if (timeRemaining <= 0 && attempt.status === "IN_PROGRESS") {
      await prisma.mockTestAttempt.update({
        where: { id: attemptId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          totalTimeSeconds: attempt.mockTest.duration,
        },
      });

      return NextResponse.json({
        status: "COMPLETED",
        reportToken: attempt.reportToken,
        reason: "time_expired",
      });
    }

    // Get full question details
    const questions = await getMockTestQuestions({
      physics: attempt.physicsQuestions,
      chemistry: attempt.chemistryQuestions,
      mathematics: attempt.mathQuestions,
    });

    // Remove correct answers from response
    const sanitizedQuestions = {
      physics: questions.physics.map((q) => ({
        ...q,
        correctAnswer: undefined,
        solution: undefined,
      })),
      chemistry: questions.chemistry.map((q) => ({
        ...q,
        correctAnswer: undefined,
        solution: undefined,
      })),
      mathematics: questions.mathematics.map((q) => ({
        ...q,
        correctAnswer: undefined,
        solution: undefined,
      })),
    };

    return NextResponse.json({
      status: "IN_PROGRESS",
      attemptId: attempt.id,
      mockTestId: attempt.mockTestId,
      mockTestName: attempt.mockTest.name,

      // Timing
      startedAt: attempt.startedAt.toISOString(),
      duration: attempt.mockTest.duration,
      timeRemaining,
      warningThresholds: {
        warning30: TIMER.WARNING_30_MIN,
        warning10: TIMER.WARNING_10_MIN,
        warning5: TIMER.WARNING_5_MIN,
      },

      // Questions
      questions: sanitizedQuestions,
      totalQuestions:
        questions.physics.length +
        questions.chemistry.length +
        questions.mathematics.length,

      // Current state
      answers: attempt.answers || {},
      visitedQuestions: attempt.visitedQuestions,
      markedForReview: attempt.markedForReview,
    });
  } catch (error) {
    console.error("Error fetching mock test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
