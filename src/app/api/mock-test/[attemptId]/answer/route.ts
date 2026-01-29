import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MockTestAnswerSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Validate input
    const result = MockTestAnswerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { questionId, answer, timeSpent } = result.data;

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
    if (elapsed >= attempt.mockTest.duration) {
      return NextResponse.json(
        { error: "Test time has expired" },
        { status: 400 }
      );
    }

    // Verify the question belongs to this attempt
    const allQuestions = [
      ...attempt.physicsQuestions,
      ...attempt.chemistryQuestions,
      ...attempt.mathQuestions,
    ];

    if (!allQuestions.includes(questionId)) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Update answers
    const currentAnswers =
      (attempt.answers as Record<
        string,
        { answer: string; timeSpent: number; savedAt: string }
      >) || {};

    const existingTimeSpent = currentAnswers[questionId]?.timeSpent || 0;
    currentAnswers[questionId] = {
      answer: answer.trim(),
      timeSpent: existingTimeSpent + timeSpent,
      savedAt: new Date().toISOString(),
    };

    // Update visited questions
    const visitedQuestions = new Set(attempt.visitedQuestions);
    visitedQuestions.add(questionId);

    // Calculate answer counts
    const answeredCount = Object.values(currentAnswers).filter(
      (a) => a.answer && a.answer.trim() !== ""
    ).length;
    const unansweredCount = allQuestions.length - answeredCount;

    // Update attempt
    await prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        answers: currentAnswers as object,
        visitedQuestions: Array.from(visitedQuestions),
        unansweredCount,
      },
    });

    return NextResponse.json({
      success: true,
      savedAt: currentAnswers[questionId].savedAt,
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
