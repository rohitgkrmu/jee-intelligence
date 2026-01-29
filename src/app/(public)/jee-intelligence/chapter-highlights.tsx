"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus, Zap, FlaskConical, Calculator } from "lucide-react";

interface ChapterData {
  chapter: string;
  subject: string;
  weightagePercent: number;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
  trend: "rising" | "falling" | "stable";
  questionCount: number;
  averageQuestionsPerYear: number;
}

export function ChapterHighlights() {
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<ChapterData[]>([]);

  useEffect(() => {
    async function fetchChapters() {
      try {
        const res = await fetch("/api/insights/chapter-importance");
        const data = await res.json();

        // Get top critical chapters
        const topChapters = data.topCriticalChapters?.slice(0, 9) || [];
        setChapters(topChapters);
      } catch (error) {
        console.error("Error fetching chapter highlights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
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

  const getImportanceStyle = (importance: string) => {
    switch (importance) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/5";
      case "HIGH":
        return "border-orange-500/30 bg-orange-500/5";
      default:
        return "border-[var(--border-dark)] bg-[var(--background-elevated)]";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case "falling":
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-[var(--background-card)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-[var(--background-card)]">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Top <span className="text-red-500">Critical</span> &amp; <span className="text-orange-500">High Priority</span> Chapters
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Master these chapters first - they carry the highest weightage in JEE
          </p>
        </div>

        {/* Chapter grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {chapters.map((chapter, idx) => (
            <Card
              key={idx}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${getImportanceStyle(chapter.importance)}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getSubjectColor(chapter.subject) as "cyan" | "purple" | "default" | "secondary"}
                      size="sm"
                      className="gap-1"
                    >
                      {getSubjectIcon(chapter.subject)}
                      {chapter.subject.slice(0, 3)}
                    </Badge>
                    {getTrendIcon(chapter.trend)}
                  </div>
                  <Badge
                    variant={chapter.importance === "CRITICAL" ? "error" : "warning"}
                    size="sm"
                  >
                    {chapter.importance}
                  </Badge>
                </div>

                <h3 className="font-semibold text-[var(--text-primary)] mb-2 leading-tight">
                  {chapter.chapter}
                </h3>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">
                    ~{chapter.averageQuestionsPerYear.toFixed(1)} Qs/year
                  </span>
                  <span className="font-bold text-lg">
                    {chapter.weightagePercent.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar showing weightage */}
                <div className="mt-2 h-1.5 bg-[var(--background-dark)] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      chapter.importance === "CRITICAL"
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : "bg-gradient-to-r from-orange-500 to-orange-400"
                    }`}
                    style={{ width: `${Math.min(chapter.weightagePercent * 4, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Critical (≥8% or 3+ Qs/year)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-500"></span>
            <span>High (5-8% or 2+ Qs/year)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
