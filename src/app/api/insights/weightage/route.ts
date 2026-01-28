import { NextRequest, NextResponse } from "next/server";
import { calculateWeightage, getTopConcepts } from "@/lib/insights";
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

    const [weightage, topConcepts] = await Promise.all([
      calculateWeightage({
        examType: examType || undefined,
        yearStart,
        yearEnd,
      }),
      getTopConcepts({
        examType: examType || undefined,
        subject: subject || undefined,
        yearStart,
        yearEnd,
        limit: 30,
      }),
    ]);

    return NextResponse.json({
      weightage,
      topConcepts,
    });
  } catch (error) {
    console.error("Error fetching weightage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
