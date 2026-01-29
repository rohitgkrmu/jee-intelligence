"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Trophy,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Target,
  Loader2,
  ChevronRight,
  Zap,
  BookOpen,
} from "lucide-react";

interface QuickInsight {
  statNumber: string;
  statLabel: string;
  detail: string;
}

interface MustStudyTopic {
  topic: string;
  chapter: string;
  subject: string;
  reason: string;
  frequency: number;
}

interface QuickWin {
  topic: string;
  chapter: string;
  subject: string;
  difficulty: "Easy" | "Medium";
  frequency: number;
  tip: string;
}

interface HotPrediction {
  topic: string;
  chapter: string;
  subject: string;
  confidence: "high" | "medium";
  lastSeen: number;
  prediction: string;
}

export function QuickInsights() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<{
    keyStats: QuickInsight[];
    mustStudy: MustStudyTopic[];
    quickWins: QuickWin[];
    hotPredictions: HotPrediction[];
  } | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const [weightageRes, roiRes, predictionsRes, difficultyRes] = await Promise.all([
          fetch("/api/insights/weightage"),
          fetch("/api/insights/roi"),
          fetch("/api/insights/predictions"),
          fetch("/api/insights/difficulty"),
        ]);

        const [weightage, roi, predictions, difficulty] = await Promise.all([
          weightageRes.json(),
          roiRes.json(),
          predictionsRes.json(),
          difficultyRes.json(),
        ]);

        // Process data for quick insights
        const subjects = weightage.weightage?.subjects || [];
        const roiConcepts = roi.conceptROI || [];
        const topicPredictions = predictions.topicPredictions || [];
        const difficultyStats = difficulty.overallStats || {};

        // Calculate key stats
        const keyStats: QuickInsight[] = [];

        // Find top chapters concentration
        subjects.forEach((subject: { subject: string; chapters: { chapter: string; percentage: number }[] }) => {
          const topChapters = subject.chapters.slice(0, 5);
          const totalPercentage = topChapters.reduce((sum: number, ch: { percentage: number }) => sum + ch.percentage, 0);
          if (totalPercentage > 50) {
            keyStats.push({
              statNumber: `${Math.round(totalPercentage)}%`,
              statLabel: `of ${subject.subject}`,
              detail: `comes from just ${topChapters.length} chapters`,
            });
          }
        });

        // Add difficulty insight
        if (difficultyStats.totalQuestions) {
          const easyMediumPercent = Math.round(
            ((difficultyStats.easyCount + difficultyStats.mediumCount) / difficultyStats.totalQuestions) * 100
          );
          keyStats.push({
            statNumber: `${easyMediumPercent}%`,
            statLabel: "Easy-Medium",
            detail: "questions are scoreable with basics",
          });
        }

        // Must study topics (appeared most frequently)
        const mustStudy: MustStudyTopic[] = roiConcepts
          .filter((c: { frequency: number; avgDifficulty: number }) => c.frequency >= 3)
          .slice(0, 5)
          .map((c: { concept: string; chapter: string; subject: string; frequency: number }) => ({
            topic: c.concept,
            chapter: c.chapter,
            subject: c.subject,
            reason: `Appeared ${c.frequency}+ times in last 5 years`,
            frequency: c.frequency,
          }));

        // Quick wins (high frequency + easy/medium difficulty)
        const quickWins: QuickWin[] = roiConcepts
          .filter((c: { avgDifficulty: number; frequency: number }) => c.avgDifficulty <= 2 && c.frequency >= 2)
          .slice(0, 4)
          .map((c: { concept: string; chapter: string; subject: string; avgDifficulty: number; frequency: number }) => ({
            topic: c.concept,
            chapter: c.chapter,
            subject: c.subject,
            difficulty: c.avgDifficulty <= 1.5 ? "Easy" as const : "Medium" as const,
            frequency: c.frequency,
            tip: "High frequency, low difficulty = guaranteed marks",
          }));

        // Hot predictions
        const hotPredictions: HotPrediction[] = topicPredictions
          .filter((p: { confidence: string }) => p.confidence === "high" || p.confidence === "medium")
          .slice(0, 4)
          .map((p: { topic: string; chapter: string; subject: string; confidence: "high" | "medium"; lastAppeared: number; reason: string }) => ({
            topic: p.topic,
            chapter: p.chapter,
            subject: p.subject,
            confidence: p.confidence,
            lastSeen: p.lastAppeared,
            prediction: p.reason,
          }));

        setInsights({
          keyStats: keyStats.slice(0, 3),
          mustStudy,
          quickWins,
          hotPredictions,
        });
      } catch (error) {
        console.error("Error fetching quick insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
      </div>
    );
  }

  if (!insights) return null;

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "PHYSICS": return "cyan";
      case "CHEMISTRY": return "purple";
      case "MATHEMATICS": return "default";
      default: return "secondary";
    }
  };

  const getSubjectEmoji = (subject: string) => {
    switch (subject) {
      case "PHYSICS": return "⚡";
      case "CHEMISTRY": return "🧪";
      case "MATHEMATICS": return "📐";
      default: return "📚";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Stats - The "Aha" Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.keyStats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden border-2 border-[var(--zenith-cyan)]/20 bg-gradient-to-br from-[var(--zenith-cyan)]/5 to-transparent"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--zenith-cyan)]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="pt-6 pb-4 relative">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[var(--zenith-cyan)]">
                  {stat.statNumber}
                </span>
                <span className="text-lg font-medium text-[var(--text-secondary)]">
                  {stat.statLabel}
                </span>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-1">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Must Study Section */}
        <Card className="border-[var(--zenith-accent)]/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Don&apos;t Skip These</h3>
                <p className="text-xs text-[var(--text-muted)]">Appeared in almost every JEE paper</p>
              </div>
            </div>
            <div className="space-y-3">
              {insights.mustStudy.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-dark)] hover:border-red-500/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold text-red-400">
                    {topic.frequency}x
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{topic.topic}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {getSubjectEmoji(topic.subject)} {topic.chapter}
                    </p>
                  </div>
                  <Badge variant={getSubjectColor(topic.subject) as "cyan" | "purple" | "default" | "secondary"} size="sm">
                    {topic.subject.slice(0, 3)}
                  </Badge>
                </div>
              ))}
              {insights.mustStudy.length === 0 && (
                <p className="text-center text-[var(--text-muted)] py-4">Loading must-study topics...</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Wins Section */}
        <Card className="border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Quick Wins</h3>
                <p className="text-xs text-[var(--text-muted)]">Easy topics that appear frequently = free marks</p>
              </div>
            </div>
            <div className="space-y-3">
              {insights.quickWins.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-dark)] hover:border-green-500/30 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Badge variant={topic.difficulty === "Easy" ? "success" : "warning"} size="sm">
                      {topic.difficulty}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{topic.topic}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {getSubjectEmoji(topic.subject)} {topic.chapter}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{topic.frequency}x</p>
                    <p className="text-xs text-[var(--text-muted)]">appeared</p>
                  </div>
                </div>
              ))}
              {insights.quickWins.length === 0 && (
                <p className="text-center text-[var(--text-muted)] py-4">Loading quick wins...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hot Predictions - Full Width */}
      {insights.hotPredictions.length > 0 && (
        <Card className="border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🔥 Hot Predictions for 2025</h3>
                <p className="text-xs text-[var(--text-muted)]">Topics likely to appear based on gap analysis</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {insights.hotPredictions.map((pred, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-[var(--background-elevated)] border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={pred.confidence === "high" ? "success" : "warning"}
                      size="sm"
                    >
                      {pred.confidence === "high" ? "🎯 High" : "📊 Medium"} confidence
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm mb-1">{pred.topic}</p>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    {getSubjectEmoji(pred.subject)} {pred.chapter}
                  </p>
                  <p className="text-xs text-yellow-400/80">
                    Last seen: {pred.lastSeen || "2+ years ago"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Value Proposition Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] p-6 md:p-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Want a Personalized Study Plan?</h3>
              <p className="text-white/80 text-sm">
                Take our free diagnostic to find YOUR weak spots and get targeted recommendations
              </p>
            </div>
          </div>
          <a
            href="/diagnostic"
            className="flex items-center gap-2 px-6 py-3 bg-white text-[var(--zenith-primary)] font-semibold rounded-lg hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Start Free Diagnostic
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
