import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    // Get attempt
    const attempt = await prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Attempt is not in progress" },
        { status: 400 }
      );
    }

    // Get current item ID
    const currentItemId = attempt.selectedItems[attempt.currentIndex];

    // Update answers with skip
    const currentAnswers = (attempt.answers as Record<string, unknown>) || {};
    currentAnswers[currentItemId] = {
      answer: null,
      isCorrect: false,
      skipped: true,
      timeSeconds: 0,
    };

    // Check if this is the last question
    const nextIndex = attempt.currentIndex + 1;
    const isComplete = nextIndex >= attempt.selectedItems.length;

    // Update attempt
    await prisma.diagnosticAttempt.update({
      where: { id: attemptId },
      data: {
        currentIndex: nextIndex,
        answers: currentAnswers as object,
        skippedCount: { increment: 1 },
        ...(isComplete && {
          status: "COMPLETED",
          completedAt: new Date(),
        }),
      },
    });

    return NextResponse.json({
      nextIndex: isComplete ? null : nextIndex,
      isComplete,
      ...(isComplete && { reportToken: attempt.reportToken }),
    });
  } catch (error) {
    console.error("Error skipping question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
