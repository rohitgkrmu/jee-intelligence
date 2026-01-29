import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { generateServerFingerprint } from "@/lib/fingerprint";
import { LeadSchema } from "@/lib/validation";
import { selectMockTestQuestions } from "@/lib/mock-test";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const fingerprint = generateServerFingerprint(request);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(ip, "/api/mock-test/start");
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please try again later.",
          resetAt: rateLimitResult.resetAt,
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validate lead data
    const result = LeadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const leadData = result.data;

    // Check if lead exists
    let lead = await prisma.lead.findUnique({
      where: { email: leadData.email },
    });

    if (lead) {
      // Update existing lead
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: leadData.name,
          phone: leadData.phone || lead.phone,
          class: leadData.class || lead.class,
          targetYear: leadData.targetYear || lead.targetYear,
          city: leadData.city || lead.city,
          school: leadData.school || lead.school,
          termsAccepted: leadData.termsAccepted,
          marketingConsent: leadData.marketingConsent,
          whatsappConsent: leadData.whatsappConsent,
          visitCount: { increment: 1 },
          lastActivityAt: new Date(),
          ipAddress: ip,
          fingerprint,
          userAgent: request.headers.get("user-agent") || undefined,
        },
      });
    } else {
      // Create new lead
      lead = await prisma.lead.create({
        data: {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone || undefined,
          class: leadData.class || undefined,
          targetYear: leadData.targetYear || undefined,
          city: leadData.city || undefined,
          school: leadData.school || undefined,
          termsAccepted: leadData.termsAccepted,
          marketingConsent: leadData.marketingConsent || false,
          whatsappConsent: leadData.whatsappConsent || false,
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
    }

    // Get or create default mock test
    let mockTest = await prisma.mockTest.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    if (!mockTest) {
      // Create default mock test
      mockTest = await prisma.mockTest.create({
        data: {
          name: "JEE Mains Full Mock Test",
          description:
            "Complete JEE Mains simulation with 90 questions across Physics, Chemistry, and Mathematics",
          examType: "MAIN",
          duration: 10800, // 3 hours
          totalQuestions: 90,
        },
      });
    }

    // Select questions for the mock test
    const selectedQuestions = await selectMockTestQuestions();

    const totalSelected =
      selectedQuestions.physics.length +
      selectedQuestions.chemistry.length +
      selectedQuestions.mathematics.length;

    if (totalSelected < 30) {
      return NextResponse.json(
        {
          error:
            "Not enough questions available in the database. Please try again later.",
        },
        { status: 503 }
      );
    }

    // Create mock test attempt
    const attempt = await prisma.mockTestAttempt.create({
      data: {
        mockTestId: mockTest.id,
        leadId: lead.id,
        physicsQuestions: selectedQuestions.physics,
        chemistryQuestions: selectedQuestions.chemistry,
        mathQuestions: selectedQuestions.mathematics,
        ipAddress: ip,
        fingerprint,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      mockTestId: mockTest.id,
      duration: mockTest.duration,
      totalQuestions:
        selectedQuestions.physics.length +
        selectedQuestions.chemistry.length +
        selectedQuestions.mathematics.length,
      questionsPerSubject: {
        physics: selectedQuestions.physics.length,
        chemistry: selectedQuestions.chemistry.length,
        mathematics: selectedQuestions.mathematics.length,
      },
    });
  } catch (error) {
    console.error("Error starting mock test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
