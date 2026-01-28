import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { DiagnosticItemSchema, PaginationSchema } from "@/lib/validation";

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

    const difficulty = searchParams.get("difficulty");
    if (difficulty) where.difficulty = difficulty;

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { concept: { contains: search, mode: "insensitive" } },
        { chapter: { contains: search, mode: "insensitive" } },
        { questionText: { contains: search, mode: "insensitive" } },
      ];
    }

    const isActive = searchParams.get("isActive");
    if (isActive !== null) where.isActive = isActive === "true";

    // Get total count
    const total = await prisma.diagnosticItem.count({ where });

    // Get items
    const items = await prisma.diagnosticItem.findMany({
      where,
      orderBy: { [pagination.sortBy || "createdAt"]: pagination.sortOrder },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return NextResponse.json({
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching diagnostic items:", error);
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
    const result = DiagnosticItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const item = await prisma.diagnosticItem.create({
      data: result.data,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating diagnostic item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
