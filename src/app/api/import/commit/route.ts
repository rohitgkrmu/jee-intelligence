import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { QuestionSchema } from "@/lib/validation";
import { z } from "zod";

const ImportCommitSchema = z.object({
  datasetSourceId: z.string().cuid(),
  fieldMappings: z.record(z.string(), z.string()),
  defaultValues: z.record(z.string(), z.unknown()).optional(),
  data: z.array(z.record(z.string(), z.unknown())),
});

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
    const parseResult = ImportCommitSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { datasetSourceId, fieldMappings, defaultValues, data } = parseResult.data;

    // Verify dataset source exists
    const datasetSource = await prisma.datasetSource.findUnique({
      where: { id: datasetSourceId },
    });

    if (!datasetSource) {
      return NextResponse.json(
        { error: "Dataset source not found" },
        { status: 404 }
      );
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as { row: number; error: string }[],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      try {
        // Map fields
        const mappedData: Record<string, unknown> = {
          datasetSourceId,
          ...defaultValues,
        };

        for (const [targetField, sourceField] of Object.entries(fieldMappings)) {
          if (sourceField && row[sourceField] !== undefined) {
            mappedData[targetField] = row[sourceField];
          }
        }

        // Parse skills array if string
        if (typeof mappedData.skills === "string") {
          mappedData.skills = (mappedData.skills as string)
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean);
        }

        // Parse tags array if string
        if (typeof mappedData.tags === "string") {
          mappedData.tags = (mappedData.tags as string)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }

        // Parse options if string (JSON)
        if (typeof mappedData.options === "string") {
          try {
            mappedData.options = JSON.parse(mappedData.options as string);
          } catch {
            // Try to parse as comma-separated list
            const opts = (mappedData.options as string).split(",").map((s) => s.trim());
            mappedData.options = opts.map((text, idx) => ({
              id: String.fromCharCode(65 + idx),
              text,
            }));
          }
        }

        // Convert examYear to number
        if (mappedData.examYear) {
          mappedData.examYear = parseInt(String(mappedData.examYear));
        }

        // Validate
        const validationResult = QuestionSchema.safeParse(mappedData);

        if (!validationResult.success) {
          results.errors.push({
            row: i + 1,
            error: validationResult.error.issues.map((e) => e.message).join(", "),
          });
          results.skipped++;
          continue;
        }

        // Upsert question (use concept + chapter + examYear as unique identifier)
        const existing = await prisma.question.findFirst({
          where: {
            concept: validationResult.data.concept,
            chapter: validationResult.data.chapter,
            examYear: validationResult.data.examYear,
            subject: validationResult.data.subject,
            datasetSourceId,
          },
        });

        if (existing) {
          await prisma.question.update({
            where: { id: existing.id },
            data: validationResult.data,
          });
          results.updated++;
        } else {
          await prisma.question.create({
            data: validationResult.data,
          });
          results.created++;
        }
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        results.skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error committing import:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
