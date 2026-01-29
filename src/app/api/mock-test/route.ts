import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const mockTests = await prisma.mockTest.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        examType: true,
        duration: true,
        totalQuestions: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    return NextResponse.json({
      tests: mockTests.map((test) => ({
        ...test,
        attemptCount: test._count.attempts,
        _count: undefined,
      })),
    });
  } catch (error) {
    console.error("Error fetching mock tests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
