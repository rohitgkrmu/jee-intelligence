"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Users, AlertTriangle } from "lucide-react";

interface HeroStat {
  totalQuestions: number;
  criticalChapters: number;
  highChapters: number;
  topChapter: string;
  topChapterSubject: string;
  topChapterPercent: number;
}

export function HeroHook() {
  const [loading, setLoading] = useState(true);
  const [heroStat, setHeroStat] = useState<HeroStat | null>(null);

  useEffect(() => {
    async function fetchHeroStat() {
      try {
        const res = await fetch("/api/insights/chapter-importance");
        const data = await res.json();

        const subjects = data.subjects || [];

        // Count critical and high chapters across all subjects
        let criticalCount = 0;
        let highCount = 0;

        subjects.forEach((s: { criticalChapters: number; highChapters: number }) => {
          criticalCount += s.criticalChapters;
          highCount += s.highChapters;
        });

        // Get the top chapter
        const topChapter = data.topCriticalChapters?.[0];

        setHeroStat({
          totalQuestions: data.totalQuestions || 0,
          criticalChapters: criticalCount,
          highChapters: highCount,
          topChapter: topChapter?.chapter || "Mechanics",
          topChapterSubject: topChapter?.subject || "PHYSICS",
          topChapterPercent: Math.round(topChapter?.weightagePercent || 16),
        });
      } catch (error) {
        console.error("Error fetching hero stat:", error);
        // Fallback stat
        setHeroStat({
          totalQuestions: 1147,
          criticalChapters: 12,
          highChapters: 18,
          topChapter: "Mechanics",
          topChapterSubject: "PHYSICS",
          topChapterPercent: 16,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchHeroStat();
  }, []);

  const formatSubject = (subject: string) => {
    return subject.charAt(0) + subject.slice(1).toLowerCase();
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--zenith-primary)]/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--zenith-cyan)]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* The Hook - Chapter focused */}
          {loading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight leading-tight">
                Only <span className="text-red-500">{heroStat?.criticalChapters} chapters</span> are
                <br />
                <span className="gradient-text">critical</span> for JEE success
              </h1>
              <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto">
                We analyzed <strong>{heroStat?.totalQuestions?.toLocaleString()}+ questions</strong> to find which chapters actually matter.
              </p>

              {/* Quick stats row */}
              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span><strong className="text-red-400">{heroStat?.criticalChapters}</strong> Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span><strong className="text-orange-400">{heroStat?.highChapters}</strong> High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>Top: <strong className="text-[var(--zenith-cyan)]">{heroStat?.topChapter}</strong> ({heroStat?.topChapterPercent}% of {formatSubject(heroStat?.topChapterSubject || "")})</span>
                </div>
              </div>
            </div>
          )}

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-4">
            <Link href="/diagnostic">
              <Button variant="gradient" size="xl" className="text-lg px-8 py-6 h-auto">
                Find Your Weak Chapters
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            {/* CTA context */}
            <p className="text-sm text-[var(--text-muted)]">
              12 questions &bull; 10 min &bull; Free forever
            </p>

            {/* Social proof */}
            <div className="flex items-center gap-2 mt-4 text-[var(--text-secondary)]">
              <Users className="w-4 h-4" />
              <span className="text-sm">Used by <strong className="text-[var(--text-primary)]">2,400+</strong> JEE aspirants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
