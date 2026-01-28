import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await validateRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Build filter
    const where: Record<string, unknown> = {};

    const classFilter = searchParams.get("class");
    if (classFilter) where.class = classFilter;

    const targetYear = searchParams.get("targetYear");
    if (targetYear) where.targetYear = parseInt(targetYear);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    // Get leads
    const leads = await prisma.lead.findMany({
      where,
      include: {
        diagnosticAttempts: {
          select: {
            readinessScore: true,
            status: true,
            completedAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV
    const headers = [
      "Name",
      "Email",
      "Phone",
      "Class",
      "Target Year",
      "City",
      "School",
      "Diagnostic Score",
      "Marketing Consent",
      "WhatsApp Consent",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Created At",
    ];

    const rows = leads.map((lead) => {
      const lastAttempt = lead.diagnosticAttempts[0];
      return [
        lead.name,
        lead.email,
        lead.phone || "",
        lead.class || "",
        lead.targetYear?.toString() || "",
        lead.city || "",
        lead.school || "",
        lastAttempt?.readinessScore?.toFixed(0) || "",
        lead.marketingConsent ? "Yes" : "No",
        lead.whatsappConsent ? "Yes" : "No",
        lead.utmSource || "",
        lead.utmMedium || "",
        lead.utmCampaign || "",
        lead.createdAt.toISOString(),
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting leads:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
