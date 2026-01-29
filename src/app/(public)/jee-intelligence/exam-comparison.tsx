"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  FlaskConical,
  Calculator,
  Lightbulb,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ChapterComparison {
  chapter: string;
  subject: string;
  mainWeightage: number;
  advancedWeightage: number;
  mainImportance: string;
  advancedImportance: string;
  difference: number;
  mainOnly: boolean;
  advancedOnly: boolean;
}

interface SubjectSummary {
  subject: string;
  totalQuestions: number;
  criticalChapters: number;
  highChapters: number;
  topChapters: {
    chapter: string;
    weightagePercent: number;
    importance: string;
  }[];
}

interface Insight {
  type: "info" | "warning" | "tip";
  title: string;
  description: string;
  subject?: string;
}

interface ComparisonData {
  main: {
    totalQuestions: number;
    yearRange: { start: number; end: number };
    subjects: SubjectSummary[];
  };
  advanced: {
    totalQuestions: number;
    yearRange: { start: number; end: number };
    subjects: SubjectSummary[];
  };
  chapterComparison: ChapterComparison[];
  insights: Insight[];
}

export function ExamComparison() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/insights/exam-comparison");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching exam comparison:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return <Zap className="w-4 h-4" />;
      case "CHEMISTRY":
        return <FlaskConical className="w-4 h-4" />;
      case "MATHEMATICS":
        return <Calculator className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return "cyan";
      case "CHEMISTRY":
        return "purple";
      case "MATHEMATICS":
        return "default";
      default:
        return "secondary";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getDifferenceIndicator = (diff: number) => {
    if (diff > 3) return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    if (diff < -3) return <ArrowDownRight className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const filteredComparison = selectedSubject
    ? data.chapterComparison.filter((c) => c.subject === selectedSubject)
    : data.chapterComparison;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            JEE <span className="text-blue-400">Main</span> vs{" "}
            <span className="text-orange-400">Advanced</span> Comparison
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            See how chapter weightage differs between the two exams. Plan your preparation accordingly.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
          {/* JEE Main Card */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-400">JEE Main</span>
                <Badge variant="secondary" size="sm">
                  {data.main.totalQuestions} questions
                </Badge>
              </CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                {data.main.yearRange.start} - {data.main.yearRange.end}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.main.subjects.map((subject) => (
                  <div key={subject.subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSubjectColor(subject.subject) as "cyan" | "purple" | "default"} size="sm">
                        {getSubjectIcon(subject.subject)}
                        {subject.subject.slice(0, 3)}
                      </Badge>
                      <span className="text-sm">{subject.totalQuestions} Qs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-red-400">{subject.criticalChapters} critical</span>
                      <span className="text-orange-400">{subject.highChapters} high</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* JEE Advanced Card */}
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="text-orange-400">JEE Advanced</span>
                <Badge variant="secondary" size="sm">
                  {data.advanced.totalQuestions} questions
                </Badge>
              </CardTitle>
              <p className="text-sm text-[var(--text-muted)]">
                {data.advanced.yearRange.start} - {data.advanced.yearRange.end}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.advanced.subjects.map((subject) => (
                  <div key={subject.subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSubjectColor(subject.subject) as "cyan" | "purple" | "default"} size="sm">
                        {getSubjectIcon(subject.subject)}
                        {subject.subject.slice(0, 3)}
                      </Badge>
                      <span className="text-sm">{subject.totalQuestions} Qs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-red-400">{subject.criticalChapters} critical</span>
                      <span className="text-orange-400">{subject.highChapters} high</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        {data.insights.length > 0 && (
          <div className="max-w-4xl mx-auto mb-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Key Differences
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {data.insights.slice(0, 6).map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-dark)]"
                >
                  {getInsightIcon(insight.type)}
                  <div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chapter Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Chapter-by-Chapter Comparison</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  !selectedSubject
                    ? "bg-[var(--zenith-cyan)] text-black"
                    : "bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                All
              </button>
              {["PHYSICS", "CHEMISTRY", "MATHEMATICS"].map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedSubject === subject
                      ? "bg-[var(--zenith-cyan)] text-black"
                      : "bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {subject.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-[var(--border-dark)]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[var(--background-elevated)] text-sm font-medium text-[var(--text-secondary)]">
              <div className="col-span-5">Chapter</div>
              <div className="col-span-3 text-center">
                <span className="text-blue-400">Main</span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-orange-400">Advanced</span>
              </div>
              <div className="col-span-1 text-center">Diff</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[var(--border-dark)]">
              {filteredComparison.slice(0, 15).map((chapter, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-[var(--background-elevated)] transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-2">
                    <Badge
                      variant={getSubjectColor(chapter.subject) as "cyan" | "purple" | "default"}
                      size="sm"
                      className="shrink-0"
                    >
                      {chapter.subject.slice(0, 3)}
                    </Badge>
                    <span className="text-sm truncate">{chapter.chapter}</span>
                  </div>
                  <div className="col-span-3 text-center">
                    {chapter.mainWeightage > 0 ? (
                      <div>
                        <span className="font-semibold">{chapter.mainWeightage.toFixed(1)}%</span>
                        <Badge
                          variant={
                            chapter.mainImportance === "CRITICAL"
                              ? "error"
                              : chapter.mainImportance === "HIGH"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                          className="ml-2"
                        >
                          {chapter.mainImportance.slice(0, 4)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                  <div className="col-span-3 text-center">
                    {chapter.advancedWeightage > 0 ? (
                      <div>
                        <span className="font-semibold">{chapter.advancedWeightage.toFixed(1)}%</span>
                        <Badge
                          variant={
                            chapter.advancedImportance === "CRITICAL"
                              ? "error"
                              : chapter.advancedImportance === "HIGH"
                              ? "warning"
                              : "secondary"
                          }
                          size="sm"
                          className="ml-2"
                        >
                          {chapter.advancedImportance.slice(0, 4)}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {getDifferenceIndicator(chapter.difference)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span>Higher in Advanced</span>
            </div>
            <div className="flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-red-400" />
              <span>Higher in Main</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-gray-400" />
              <span>Similar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
