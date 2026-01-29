"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, Flame, Zap, FlaskConical, Calculator } from "lucide-react";

interface SubjectTeaser {
  subject: string;
  chapterCount: number;
  percentage: number;
  topChapters: string[];
  criticalChapters: number;
  highChapters: number;
}

export function SubjectTeasers() {
  const [loading, setLoading] = useState(true);
  const [teasers, setTeasers] = useState<SubjectTeaser[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeasers() {
      try {
        const [weightageRes, importanceRes] = await Promise.all([
          fetch("/api/insights/weightage"),
          fetch("/api/insights/chapter-importance"),
        ]);

        const [weightageData, importanceData] = await Promise.all([
          weightageRes.json(),
          importanceRes.json(),
        ]);

        const subjects = weightageData.weightage?.subjects || [];
        const importanceSubjects = importanceData.subjects || [];

        const processedTeasers: SubjectTeaser[] = subjects.map((subject: {
          subject: string;
          chapters: { chapter: string; percentage: number }[]
        }) => {
          const topChapters = subject.chapters.slice(0, 5);
          const totalPercentage = topChapters.reduce((sum: number, ch: { percentage: number }) => sum + ch.percentage, 0);

          // Find importance data for this subject
          const importanceSubject = importanceSubjects.find(
            (s: { subject: string }) => s.subject === subject.subject
          );

          return {
            subject: subject.subject,
            chapterCount: topChapters.length,
            percentage: Math.round(totalPercentage),
            topChapters: topChapters.map((ch: { chapter: string }) => ch.chapter),
            criticalChapters: importanceSubject?.criticalChapters || 0,
            highChapters: importanceSubject?.highChapters || 0,
          };
        });

        setTeasers(processedTeasers);
      } catch (error) {
        console.error("Error fetching subject teasers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTeasers();
  }, []);

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return <Zap className="w-6 h-6" />;
      case "CHEMISTRY":
        return <FlaskConical className="w-6 h-6" />;
      case "MATHEMATICS":
        return <Calculator className="w-6 h-6" />;
      default:
        return <Flame className="w-6 h-6" />;
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return {
          gradient: "from-cyan-500/20 to-blue-500/20",
          border: "border-cyan-500/30",
          text: "text-cyan-400",
          iconBg: "bg-cyan-500/20",
        };
      case "CHEMISTRY":
        return {
          gradient: "from-purple-500/20 to-pink-500/20",
          border: "border-purple-500/30",
          text: "text-purple-400",
          iconBg: "bg-purple-500/20",
        };
      case "MATHEMATICS":
        return {
          gradient: "from-blue-500/20 to-indigo-500/20",
          border: "border-blue-500/30",
          text: "text-blue-400",
          iconBg: "bg-blue-500/20",
        };
      default:
        return {
          gradient: "from-gray-500/20 to-gray-600/20",
          border: "border-gray-500/30",
          text: "text-gray-400",
          iconBg: "bg-gray-500/20",
        };
    }
  };

  const formatSubjectName = (subject: string) => {
    return subject.charAt(0) + subject.slice(1).toLowerCase();
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

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Subject-wise <span className="gradient-text">Chapter Breakdown</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            See how many critical chapters each subject has. Click to explore.
          </p>
        </div>

        {/* Subject cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {teasers.map((teaser) => {
            const colors = getSubjectColor(teaser.subject);
            const isExpanded = expandedSubject === teaser.subject;

            return (
              <Card
                key={teaser.subject}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${colors.border} hover:scale-[1.02]`}
                onClick={() => setExpandedSubject(isExpanded ? null : teaser.subject)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-50`} />

                <CardContent className="pt-6 pb-4 relative">
                  {/* Icon and subject name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                      <span className={colors.text}>{getSubjectIcon(teaser.subject)}</span>
                    </div>
                    <span className="font-semibold text-lg">{formatSubjectName(teaser.subject)}</span>
                  </div>

                  {/* Main stat */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl font-black ${colors.text}`}>
                        {teaser.criticalChapters + teaser.highChapters}
                      </span>
                      <span className="text-[var(--text-secondary)]">key chapters</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                      cover <span className={`font-semibold ${colors.text}`}>{teaser.percentage}%</span> of questions
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {teaser.criticalChapters} critical
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        {teaser.highChapters} high
                      </span>
                    </div>
                  </div>

                  {/* Reveal prompt or revealed chapters */}
                  {!isExpanded ? (
                    <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)] mt-4">
                      <span>Click to reveal</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="mt-4 pt-4 border-t border-[var(--border-dark)]">
                      <p className="text-xs text-[var(--text-muted)] mb-2">Top chapters:</p>
                      <div className="flex flex-wrap gap-1">
                        {teaser.topChapters.slice(0, 3).map((chapter, idx) => (
                          <Badge key={idx} variant="secondary" size="sm" className="text-xs">
                            {chapter.length > 20 ? chapter.slice(0, 20) + "..." : chapter}
                          </Badge>
                        ))}
                      </div>
                      <Link
                        href="/diagnostic"
                        className={`inline-flex items-center gap-1 text-xs ${colors.text} mt-3 hover:underline`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Get your personalized list <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
