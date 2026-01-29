import { NextResponse } from "next/server";
import { getNextExamPredictions } from "@/lib/insights";

export async function GET() {
  try {
    const predictions = await getNextExamPredictions();
    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}
