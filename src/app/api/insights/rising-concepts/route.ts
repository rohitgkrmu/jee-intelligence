import { NextRequest, NextResponse } from "next/server";
import { getRisingConcepts, getFallingConcepts } from "@/lib/insights";
import type { Subject, ExamType } from "@prisma/client";

export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const examType = searchParams.get("examType") as ExamType | null;
    const subject = searchParams.get("subject") as Subject | null;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 10;

    const [risingConcepts, fallingConcepts] = await Promise.all([
      getRisingConcepts({
        examType: examType || undefined,
        subject: subject || undefined,
        limit,
      }),
      getFallingConcepts({
        examType: examType || undefined,
        subject: subject || undefined,
        limit,
      }),
    ]);

    return NextResponse.json({
      risingConcepts,
      fallingConcepts,
    });
  } catch (error) {
    console.error("Error fetching rising/falling concepts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
