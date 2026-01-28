"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface ParsedData {
  fileName: string;
  totalRows: number;
  headers: string[];
  preview: Record<string, unknown>[];
  data: Record<string, unknown>[];
}

interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; error: string }[];
}

const FIELD_MAPPINGS = [
  { value: "examType", label: "Exam Type" },
  { value: "examYear", label: "Exam Year" },
  { value: "examSession", label: "Exam Session" },
  { value: "subject", label: "Subject" },
  { value: "chapter", label: "Chapter" },
  { value: "topic", label: "Topic" },
  { value: "concept", label: "Concept" },
  { value: "questionType", label: "Question Type" },
  { value: "difficulty", label: "Difficulty" },
  { value: "skills", label: "Skills" },
  { value: "questionText", label: "Question Text" },
  { value: "options", label: "Options (JSON)" },
  { value: "correctAnswer", label: "Correct Answer" },
  { value: "solution", label: "Solution" },
  { value: "tags", label: "Tags" },
];

export default function ImportPage() {
  const [step, setStep] = useState<"upload" | "mapping" | "importing" | "complete">("upload");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({});
  const [datasetSourceId, setDatasetSourceId] = useState("");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed");
        return;
      }

      setParsedData(data);
      setStep("mapping");

      // Auto-detect field mappings
      const autoMappings: Record<string, string> = {};
      data.headers.forEach((header: string) => {
        const normalizedHeader = header.toLowerCase().replace(/[_\s]/g, "");
        FIELD_MAPPINGS.forEach((field) => {
          if (normalizedHeader === field.value.toLowerCase()) {
            autoMappings[field.value] = header;
          }
        });
      });
      setFieldMappings(autoMappings);
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleImport = async () => {
    if (!parsedData || !datasetSourceId) {
      setError("Please select a dataset source");
      return;
    }

    setImporting(true);
    setStep("importing");
    setError("");

    try {
      const response = await fetch("/api/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetSourceId,
          fieldMappings,
          data: parsedData.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Import failed");
        setStep("mapping");
        return;
      }

      setImportResult(data.results);
      setStep("complete");
    } catch (err) {
      setError("Network error. Please try again.");
      setStep("mapping");
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setParsedData(null);
    setFieldMappings({});
    setDatasetSourceId("");
    setImportResult(null);
    setError("");
    setStep("upload");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Questions</h1>
        <p className="text-[var(--text-muted)]">
          Upload CSV or JSON files to import questions
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-[var(--border-light)] rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--zenith-primary)]/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-[var(--zenith-primary)]" />
                </div>
                <div>
                  <p className="font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    CSV or JSON files only
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mapping */}
      {step === "mapping" && parsedData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                {parsedData.fileName}
              </CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                {parsedData.totalRows} rows found
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Dataset Source *
                  </label>
                  <Select
                    options={[
                      { value: "", label: "Select a dataset source" },
                      // These would come from the API in production
                    ]}
                    value={datasetSourceId}
                    onChange={(e) => setDatasetSourceId(e.target.value)}
                    placeholder="Select dataset source"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Create dataset sources in the database first
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Field Mappings</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {FIELD_MAPPINGS.map((field) => (
                      <div key={field.value}>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">
                          {field.label}
                        </label>
                        <Select
                          options={[
                            { value: "", label: "Not mapped" },
                            ...parsedData.headers.map((h) => ({
                              value: h,
                              label: h,
                            })),
                          ]}
                          value={fieldMappings[field.value] || ""}
                          onChange={(e) =>
                            setFieldMappings({
                              ...fieldMappings,
                              [field.value]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview (First 5 rows)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-dark)]">
                      {parsedData.headers.slice(0, 6).map((header) => (
                        <th
                          key={header}
                          className="p-2 text-left text-[var(--text-muted)]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.preview.slice(0, 5).map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-[var(--border-dark)]"
                      >
                        {parsedData.headers.slice(0, 6).map((header) => (
                          <td
                            key={header}
                            className="p-2 text-[var(--text-secondary)] max-w-[200px] truncate"
                          >
                            {String(row[header] || "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={resetImport}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!datasetSourceId}
            >
              Start Import
            </Button>
          </div>
        </>
      )}

      {/* Step 3: Importing */}
      {step === "importing" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[var(--zenith-cyan)] mx-auto mb-4" />
            <p className="font-medium mb-2">Importing questions...</p>
            <p className="text-sm text-[var(--text-muted)]">
              Please wait, this may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && importResult && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold">Import Complete</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-400">
                  {importResult.created}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Created</p>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-400">
                  {importResult.updated}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Updated</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">
                  {importResult.skipped}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Skipped</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Errors ({importResult.errors.length})
                </h3>
                <div className="max-h-40 overflow-y-auto bg-[var(--background-elevated)] rounded-lg p-3">
                  {importResult.errors.slice(0, 10).map((err, index) => (
                    <p key={index} className="text-sm text-[var(--text-muted)]">
                      Row {err.row}: {err.error}
                    </p>
                  ))}
                  {importResult.errors.length > 10 && (
                    <p className="text-sm text-[var(--text-muted)]">
                      ... and {importResult.errors.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button variant="primary" onClick={resetImport} className="w-full">
              Import Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
