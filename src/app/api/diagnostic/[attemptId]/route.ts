import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDiagnosticItem } from "@/lib/diagnostic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    const attempt = await prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json(
        { error: "Attempt not found" },
        { status: 404 }
      );
    }

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

    // Get current question
    const currentItemId = attempt.selectedItems[attempt.currentIndex];
    if (!currentItemId) {
      return NextResponse.json(
        { error: "No more questions" },
        { status: 400 }
      );
    }

    const item = await getDiagnosticItem(currentItemId);
    if (!item) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Don't send the correct answer to the client
    return NextResponse.json({
      status: "IN_PROGRESS",
      currentIndex: attempt.currentIndex,
      totalQuestions: attempt.selectedItems.length,
      question: {
        id: item.id,
        subject: item.subject,
        chapter: item.chapter,
        questionType: item.questionType,
        difficulty: item.difficulty,
        questionText: item.questionText,
        options: item.options,
        hint: item.hint,
      },
    });
  } catch (error) {
    console.error("Error fetching diagnostic question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
