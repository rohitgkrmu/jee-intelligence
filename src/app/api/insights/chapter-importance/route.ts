import { NextRequest, NextResponse } from "next/server";
import { analyzeSyllabusWeightage, getChapterDetail } from "@/lib/insights";
import type { Subject, ExamType } from "@prisma/client";

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const examType = searchParams.get("examType") as ExamType | null;
    const chapter = searchParams.get("chapter");
    const subject = searchParams.get("subject") as Subject | null;
    const yearStart = searchParams.get("yearStart")
      ? parseInt(searchParams.get("yearStart")!)
      : undefined;
    const yearEnd = searchParams.get("yearEnd")
      ? parseInt(searchParams.get("yearEnd")!)
      : undefined;

    // If specific chapter is requested, return detailed data
    if (chapter && subject) {
      const detail = await getChapterDetail(chapter, subject, {
        examType: examType || undefined,
        yearStart,
        yearEnd,
      });

      if (!detail) {
        return NextResponse.json(
          { error: "Chapter not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ chapterDetail: detail });
    }

    // Otherwise return full analysis
    const analysis = await analyzeSyllabusWeightage({
      examType: examType || undefined,
      yearStart,
      yearEnd,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching chapter importance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
