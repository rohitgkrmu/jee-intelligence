import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMockTestQuestions } from "@/lib/mock-test";
import {
  calculateScores,
  calculateTimeStats,
  estimatePercentile,
} from "@/lib/mock-test/scoring";
import type { AnswerState } from "@/lib/mock-test/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;
    const body = await request.json();

    // Get attempt
    const attempt = await prisma.mockTestAttempt.findUnique({
      where: { id: attemptId },
      include: { mockTest: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status === "COMPLETED") {
      return NextResponse.json({
        status: "COMPLETED",
        reportToken: attempt.reportToken,
        message: "Test already submitted",
      });
    }

    if (attempt.status === "ABANDONED") {
      return NextResponse.json(
        { error: "This attempt has been abandoned" },
        { status: 410 }
      );
    }

    // Merge final answers from client with server state
    const serverAnswers =
      (attempt.answers as Record<
        string,
        { answer: string; timeSpent: number; savedAt: string }
      >) || {};
    const clientAnswers = body.answers || {};

    const finalAnswers: Record<string, AnswerState> = {};

    // Combine all answers, preferring client answers if they're more recent
    for (const [questionId, serverAnswer] of Object.entries(serverAnswers)) {
      finalAnswers[questionId] = {
        answer: serverAnswer.answer,
        timeSpent: serverAnswer.timeSpent,
        savedAt: new Date(serverAnswer.savedAt),
      };
    }

    for (const [questionId, clientAnswer] of Object.entries(clientAnswers)) {
      const existing = finalAnswers[questionId];
      const client = clientAnswer as { answer: string; timeSpent: number };

      if (!existing || client.answer !== existing.answer) {
        finalAnswers[questionId] = {
          answer: client.answer,
          timeSpent: (existing?.timeSpent || 0) + client.timeSpent,
          savedAt: new Date(),
        };
      }
    }

    // Get questions with correct answers
    const questions = await getMockTestQuestions({
      physics: attempt.physicsQuestions,
      chemistry: attempt.chemistryQuestions,
      mathematics: attempt.mathQuestions,
    });

    // Calculate scores
    const scoreResult = calculateScores({
      questions,
      answers: finalAnswers,
    });

    // Calculate time statistics
    const elapsed = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );
    const totalTimeSeconds = Math.min(elapsed, attempt.mockTest.duration);

    const timeStats = calculateTimeStats(
      finalAnswers,
      attempt.physicsQuestions.length +
        attempt.chemistryQuestions.length +
        attempt.mathQuestions.length
    );

    // Convert answers to JSON-serializable format
    const answersForDb: Record<
      string,
      { answer: string; timeSpent: number; savedAt: string }
    > = {};
    for (const [questionId, answer] of Object.entries(finalAnswers)) {
      answersForDb[questionId] = {
        answer: answer.answer,
        timeSpent: answer.timeSpent,
        savedAt: answer.savedAt.toISOString(),
      };
    }

    // Update attempt with final results
    await prisma.mockTestAttempt.update({
      where: { id: attemptId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        answers: answersForDb as object,
        physicsScore: scoreResult.physicsScore.score,
        chemistryScore: scoreResult.chemistryScore.score,
        mathScore: scoreResult.mathScore.score,
        totalScore: scoreResult.totalScore,
        correctCount: scoreResult.totalCorrect,
        incorrectCount: scoreResult.totalIncorrect,
        unansweredCount: scoreResult.totalUnanswered,
        totalTimeSeconds,
      },
    });

    // Calculate percentile
    const maxScore =
      scoreResult.physicsScore.maxScore +
      scoreResult.chemistryScore.maxScore +
      scoreResult.mathScore.maxScore;
    const percentile = estimatePercentile(scoreResult.totalScore, maxScore);

    return NextResponse.json({
      status: "COMPLETED",
      reportToken: attempt.reportToken,
      summary: {
        totalScore: scoreResult.totalScore,
        maxScore,
        percentile,
        correct: scoreResult.totalCorrect,
        incorrect: scoreResult.totalIncorrect,
        unanswered: scoreResult.totalUnanswered,
        timeSpent: totalTimeSeconds,
        averageTimePerQuestion: timeStats.averageTimePerQuestion,
      },
    });
  } catch (error) {
    console.error("Error submitting mock test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
