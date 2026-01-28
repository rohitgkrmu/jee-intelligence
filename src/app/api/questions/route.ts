import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { QuestionSchema, PaginationSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const admin = await validateRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Parse pagination
    const paginationResult = PaginationSchema.safeParse({
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    });

    const pagination = paginationResult.success
      ? paginationResult.data
      : { page: 1, limit: 20, sortOrder: "desc" as const };

    // Build filter
    const where: Record<string, unknown> = {};

    const subject = searchParams.get("subject");
    if (subject) where.subject = subject;

    const examType = searchParams.get("examType");
    if (examType) where.examType = examType;

    const difficulty = searchParams.get("difficulty");
    if (difficulty) where.difficulty = difficulty;

    const chapter = searchParams.get("chapter");
    if (chapter) where.chapter = { contains: chapter, mode: "insensitive" };

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { concept: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
        { questionText: { contains: search, mode: "insensitive" } },
      ];
    }

    const isActive = searchParams.get("isActive");
    if (isActive !== null) where.isActive = isActive === "true";

    // Get total count
    const total = await prisma.question.count({ where });

    // Get questions
    const questions = await prisma.question.findMany({
      where,
      include: {
        datasetSource: {
          select: { name: true, type: true },
        },
      },
      orderBy: { [pagination.sortBy || "createdAt"]: pagination.sortOrder },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return NextResponse.json({
      questions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await validateRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const result = QuestionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: result.data,
      include: {
        datasetSource: {
          select: { name: true, type: true },
        },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
