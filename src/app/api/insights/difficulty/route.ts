import { NextResponse } from "next/server";
import { getDifficultyAnalysis } from "@/lib/insights";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearStart = parseInt(searchParams.get("yearStart") || "2020");
    const yearEnd = parseInt(searchParams.get("yearEnd") || "2025");

    const analysis = await getDifficultyAnalysis(yearStart, yearEnd);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error fetching difficulty analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch difficulty analysis" },
      { status: 500 }
    );
  }
}
