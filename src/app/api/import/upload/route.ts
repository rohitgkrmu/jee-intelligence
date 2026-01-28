import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await validateRequest(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = [
      "text/csv",
      "application/json",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".json")) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV and JSON files are allowed." },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();

    // Parse based on file type
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];

    if (file.name.endsWith(".json") || file.type === "application/json") {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          data = parsed;
          if (data.length > 0) {
            headers = Object.keys(data[0]);
          }
        } else {
          return NextResponse.json(
            { error: "JSON must be an array of objects" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON format" },
          { status: 400 }
        );
      }
    } else {
      // Parse CSV
      const lines = content.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        return NextResponse.json(
          { error: "CSV must have at least a header row and one data row" },
          { status: 400 }
        );
      }

      headers = parseCSVLine(lines[0]);
      data = lines.slice(1).map((line) => {
        const values = parseCSVLine(line);
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });
    }

    // Return preview (first 10 rows)
    return NextResponse.json({
      success: true,
      fileName: file.name,
      totalRows: data.length,
      headers,
      preview: data.slice(0, 10),
      data, // Full data for commit
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
