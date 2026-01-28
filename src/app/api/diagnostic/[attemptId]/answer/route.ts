import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDiagnosticItem } from "@/lib/diagnostic";
import { AnswerSubmissionSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Validate input
    const result = AnswerSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { itemId, answer, timeSeconds } = result.data;

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

    // Verify the item is the current one
    const currentItemId = attempt.selectedItems[attempt.currentIndex];
    if (currentItemId !== itemId) {
      return NextResponse.json(
        { error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Get the diagnostic item to check answer
    const item = await getDiagnosticItem(itemId);
    if (!item) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = item.correctAnswer.toLowerCase() === answer.toLowerCase();

    // Update answers
    const currentAnswers = (attempt.answers as Record<string, unknown>) || {};
    currentAnswers[itemId] = {
      answer,
      isCorrect,
      timeSeconds: timeSeconds || 0,
    };

    // Calculate new counts
    const correctCount = isCorrect
      ? attempt.correctCount + 1
      : attempt.correctCount;
    const incorrectCount = !isCorrect
      ? attempt.incorrectCount + 1
      : attempt.incorrectCount;

    // Check if this is the last question
    const nextIndex = attempt.currentIndex + 1;
    const isComplete = nextIndex >= attempt.selectedItems.length;

    // Update attempt
    await prisma.diagnosticAttempt.update({
      where: { id: attemptId },
      data: {
        currentIndex: nextIndex,
        answers: currentAnswers as object,
        correctCount,
        incorrectCount,
        ...(isComplete && {
          status: "COMPLETED",
          completedAt: new Date(),
          totalTimeSeconds: Object.values(currentAnswers).reduce(
            (sum: number, a) => sum + ((a as { timeSeconds?: number }).timeSeconds || 0),
            0
          ),
        }),
      },
    });

    return NextResponse.json({
      isCorrect,
      correctAnswer: item.correctAnswer,
      solution: item.solution,
      nextIndex: isComplete ? null : nextIndex,
      isComplete,
      ...(isComplete && { reportToken: attempt.reportToken }),
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
