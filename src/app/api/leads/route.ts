import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { generateServerFingerprint } from "@/lib/fingerprint";
import { LeadSchema, PaginationSchema } from "@/lib/validation";

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

    const classFilter = searchParams.get("class");
    if (classFilter) where.class = classFilter;

    const targetYear = searchParams.get("targetYear");
    if (targetYear) where.targetYear = parseInt(targetYear);

    const city = searchParams.get("city");
    if (city) where.city = { contains: city, mode: "insensitive" };

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    // Get total count
    const total = await prisma.lead.count({ where });

    // Get leads
    const leads = await prisma.lead.findMany({
      where,
      include: {
        diagnosticAttempts: {
          select: {
            id: true,
            status: true,
            readinessScore: true,
            completedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { [pagination.sortBy || "createdAt"]: pagination.sortOrder },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return NextResponse.json({
      leads,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(ip, "/api/leads");
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = LeadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const fingerprint = generateServerFingerprint(request);

    // Check if lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { email: result.data.email },
    });

    if (existingLead) {
      // Update existing lead
      const lead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          ...result.data,
          visitCount: { increment: 1 },
          lastActivityAt: new Date(),
          ipAddress: ip,
          fingerprint,
          userAgent: request.headers.get("user-agent") || undefined,
        },
      });

      return NextResponse.json({ lead, isNew: false });
    }

    // Create new lead
    const lead = await prisma.lead.create({
      data: {
        ...result.data,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmTerm: body.utmTerm,
        utmContent: body.utmContent,
        ipAddress: ip,
        fingerprint,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({ lead, isNew: true }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
