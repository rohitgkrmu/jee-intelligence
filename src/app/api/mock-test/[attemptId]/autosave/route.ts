import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MockTestAutosaveSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Validate input
    const result = MockTestAutosaveSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, visitedQuestions, markedForReview } = result.data;

    // Get attempt
    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: { mockTest: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Attempt is not in progress" },
        { status: 400 }
      );
    }

    // Check if time has expired
    const elapsed = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );
    const timeRemaining = attempt.mockTest.duration - elapsed;

    if (timeRemaining <= 0) {
      // Auto-submit if time expired
      return NextResponse.json(
        { error: "Test time has expired", shouldSubmit: true },
        { status: 400 }
      );
    }

    // Merge answers with existing (server answers take precedence for timestamps)
    const existingAnswers =
      (attempt.answers as Record<
        string,
        { answer: string; timeSpent: number; savedAt: string }
      >) || {};

    const mergedAnswers: Record<
      string,
      { answer: string; timeSpent: number; savedAt: string }
    > = { ...existingAnswers };

    for (const [questionId, answerData] of Object.entries(answers)) {
      const existing = existingAnswers[questionId];
      mergedAnswers[questionId] = {
        answer: answerData.answer,
        timeSpent: (existing?.timeSpent || 0) + answerData.timeSpent,
        savedAt: new Date().toISOString(),
      };
    }

    // Calculate counts
    const allQuestions = [
      ...attempt.physicsQuestions,
      ...attempt.chemistryQuestions,
      ...attempt.mathQuestions,
    ];

    const answeredCount = Object.values(mergedAnswers).filter(
      (a) => a.answer && a.answer.trim() !== ""
    ).length;
    const unansweredCount = allQuestions.length - answeredCount;

    // Update attempt
    await prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        answers: mergedAnswers as object,
        visitedQuestions,
        markedForReview,
        unansweredCount,
      },
    });

    return NextResponse.json({
      success: true,
      timeRemaining,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error autosaving:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
