import { NextRequest, NextResponse } from "next/server";
import { analyzeConceptTrends, getSubjectTrends } from "@/lib/insights";
import type { Subject, ExamType } from "@prisma/client";

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const examType = searchParams.get("examType") as ExamType | null;
    const subject = searchParams.get("subject") as Subject | null;
    const yearStart = searchParams.get("yearStart")
      ? parseInt(searchParams.get("yearStart")!)
      : undefined;
    const yearEnd = searchParams.get("yearEnd")
      ? parseInt(searchParams.get("yearEnd")!)
      : undefined;

    const [conceptTrends, subjectTrends] = await Promise.all([
      analyzeConceptTrends({
        examType: examType || undefined,
        subject: subject || undefined,
        yearStart,
        yearEnd,
      }),
      getSubjectTrends({
        examType: examType || undefined,
        yearStart,
        yearEnd,
      }),
    ]);

    return NextResponse.json({
      conceptTrends: conceptTrends.slice(0, 50), // Top 50
      subjectTrends,
    });
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
