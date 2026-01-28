import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import { generateServerFingerprint } from "@/lib/fingerprint";
import { selectDiagnosticQuestions } from "@/lib/diagnostic";
import { LeadSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const fingerprint = generateServerFingerprint(request);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(ip, "/api/diagnostic/start");
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

    // Select diagnostic questions
    const selectedItems = await selectDiagnosticQuestions();

    if (selectedItems.length === 0) {
      return NextResponse.json(
        { error: "No diagnostic questions available. Please try again later." },
        { status: 503 }
      );
    }

    // Create diagnostic attempt
    const attempt = await prisma.diagnosticAttempt.create({
      data: {
        leadId: lead.id,
        selectedItems,
        ipAddress: ip,
        fingerprint,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      totalQuestions: selectedItems.length,
    });
  } catch (error) {
    console.error("Error starting diagnostic:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
