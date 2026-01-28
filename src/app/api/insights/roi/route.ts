import { NextRequest, NextResponse } from "next/server";
import { calculateROI, calculateChapterROI, generateStudyPriorities } from "@/lib/insights";
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
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 30;

    const [conceptROI, chapterROI, studyPriorities] = await Promise.all([
      calculateROI({
        examType: examType || undefined,
        subject: subject || undefined,
        yearStart,
        yearEnd,
        limit,
      }),
      calculateChapterROI({
        examType: examType || undefined,
        subject: subject || undefined,
        yearStart,
        yearEnd,
      }),
      generateStudyPriorities({
        examType: examType || undefined,
        limit: 20,
      }),
    ]);

    return NextResponse.json({
      conceptROI,
      chapterROI,
      studyPriorities,
    });
  } catch (error) {
    console.error("Error fetching ROI:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
