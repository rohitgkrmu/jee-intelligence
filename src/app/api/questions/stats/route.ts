import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("examType") as "MAIN" | "ADVANCED" | null;

    const whereClause = examType ? { examType, isActive: true } : { isActive: true };

    // Get total questions
    const totalQuestions = await prisma.question.count({
      where: whereClause,
    });

    // Get counts by subject
    const subjectCounts = await prisma.question.groupBy({
      by: ["subject"],
      where: whereClause,
      _count: true,
    });

    // Get counts by difficulty
    const difficultyCounts = await prisma.question.groupBy({
      by: ["difficulty"],
      where: whereClause,
      _count: true,
    });

    // Get counts by year
    const yearCounts = await prisma.question.groupBy({
      by: ["examYear"],
      where: whereClause,
      _count: true,
      orderBy: { examYear: "asc" },
    });

    // Get unique chapters count
    const chapters = await prisma.question.findMany({
      where: whereClause,
      select: { chapter: true },
      distinct: ["chapter"],
    });

    // Get unique concepts count
    const concepts = await prisma.question.findMany({
      where: whereClause,
      select: { concept: true },
      distinct: ["concept"],
    });

    return NextResponse.json({
      totalQuestions,
      subjectCounts: subjectCounts.map((s) => ({
        subject: s.subject,
        count: s._count,
      })),
      difficultyCounts: difficultyCounts.map((d) => ({
        difficulty: d.difficulty,
        count: d._count,
      })),
      yearCounts: yearCounts.map((y) => ({
        year: y.examYear,
        count: y._count,
      })),
      uniqueChapters: chapters.length,
      uniqueConcepts: concepts.length,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
