"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendChart } from "@/components/charts/trend-chart";
import { WeightageChart } from "@/components/charts/weightage-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { ChapterImportanceChart } from "@/components/charts/chapter-importance-chart";
import { TrendingUp, TrendingDown, Minus, Loader2, Target, BarChart3, Zap, Brain, BookOpen, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ConceptTrend {
  concept: string;
  chapter: string;
  subject: string;
  totalCount: number;
  yearlyCounts: { year: number; count: number }[];
  trend: "rising" | "falling" | "stable";
  slope: number;
}

interface SubjectTrend {
  subject: string;
  yearlyCounts: { year: number; count: number }[];
  averagePerYear: number;
}

interface SubjectWeightage {
  subject: string;
  totalQuestions: number;
  percentage: number;
  chapters: { chapter: string; count: number; percentage: number }[];
}

interface ROIConcept {
  concept: string;
  chapter: string;
  subject: string;
  frequency: number;
  avgDifficulty: number;
  roiScore: number;
  recommendation: string;
}

interface DifficultyStats {
  chapter: string;
  subject: string;
  totalQuestions: number;
  easy: number;
  medium: number;
  hard: number;
  averageDifficulty: number;
  hardRatio: number;
}

interface SubjectDifficultyProfile {
  subject: string;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  totalQuestions: number;
  hardestChapters: { chapter: string; hardRatio: number }[];
  easiestChapters: { chapter: string; easyRatio: number }[];
}

interface PredictedTopic {
  topic: string;
  chapter: string;
  subject: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  historicalFrequency: number;
  lastAppeared: number;
  gapYears: number;
}

interface ChapterPrediction {
  chapter: string;
  subject: string;
  expectedQuestions: number;
  confidence: number;
  trend: "increasing" | "stable" | "decreasing";
  hotTopics: string[];
}

type ImportanceLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";

interface ChapterImportance {
  chapter: string;
  subject: string;
  questionCount: number;
  weightagePercent: number;
  importance: ImportanceLevel;
  trend: "rising" | "falling" | "stable";
  yearlyData: { year: number; count: number }[];
  averageQuestionsPerYear: number;
  lastYearCount: number;
  inSyllabus: boolean;
  relatedTopics: string[];
}

interface SubjectImportanceData {
  subject: string;
  totalQuestions: number;
  chapters: ChapterImportance[];
  criticalChapters: number;
  highChapters: number;
  mediumChapters: number;
  lowChapters: number;
}

interface ChapterImportanceData {
  totalQuestions: number;
  subjects: SubjectImportanceData[];
  topCriticalChapters: ChapterImportance[];
  deletedTopicsAppearing: string[];
}

export function InsightsSection() {
  const [activeTab, setActiveTab] = useState("chapter-importance");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    conceptTrends: ConceptTrend[];
    subjectTrends: SubjectTrend[];
    weightage: { subjects: SubjectWeightage[] };
    roiConcepts: ROIConcept[];
    risingConcepts: ConceptTrend[];
    fallingConcepts: ConceptTrend[];
    difficulty: {
      chapterDifficulty: DifficultyStats[];
      subjectProfiles: SubjectDifficultyProfile[];
      overallStats: { totalQuestions: number; easyCount: number; mediumCount: number; hardCount: number };
    };
    predictions: {
      topicPredictions: PredictedTopic[];
      chapterPredictions: ChapterPrediction[];
      insights: { highConfidencePredictions: number; totalAnalyzedTopics: number; yearsCovered: number[] };
    };
    chapterImportance: ChapterImportanceData | null;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendsRes, weightageRes, roiRes, risingRes, difficultyRes, predictionsRes, chapterImportanceRes] = await Promise.all([
          fetch("/api/insights/trends"),
          fetch("/api/insights/weightage"),
          fetch("/api/insights/roi"),
          fetch("/api/insights/rising-concepts"),
          fetch("/api/insights/difficulty"),
          fetch("/api/insights/predictions"),
          fetch("/api/insights/chapter-importance"),
        ]);

        const [trends, weightage, roi, rising, difficulty, predictions, chapterImportance] = await Promise.all([
          trendsRes.json(),
          weightageRes.json(),
          roiRes.json(),
          risingRes.json(),
          difficultyRes.json(),
          predictionsRes.json(),
          chapterImportanceRes.json(),
        ]);

        setData({
          conceptTrends: trends.conceptTrends || [],
          subjectTrends: trends.subjectTrends || [],
          weightage: weightage.weightage || { subjects: [] },
          roiConcepts: roi.conceptROI || [],
          risingConcepts: rising.risingConcepts || [],
          fallingConcepts: rising.fallingConcepts || [],
          difficulty: difficulty,
          predictions: predictions,
          chapterImportance: chapterImportance,
        });
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p>Unable to load insights. Please try again later.</p>
      </div>
    );
  }

  const trendChartData =
    data.subjectTrends.length > 0
      ? data.subjectTrends[0].yearlyCounts.map((yc) => {
          const physics = data.subjectTrends.find((s) => s.subject === "PHYSICS");
          const chemistry = data.subjectTrends.find((s) => s.subject === "CHEMISTRY");
          const mathematics = data.subjectTrends.find((s) => s.subject === "MATHEMATICS");

          return {
            year: yc.year,
            physics: physics?.yearlyCounts.find((y) => y.year === yc.year)?.count || 0,
            chemistry: chemistry?.yearlyCounts.find((y) => y.year === yc.year)?.count || 0,
            mathematics: mathematics?.yearlyCounts.find((y) => y.year === yc.year)?.count || 0,
          };
        })
      : [];

  const weightageChartData = data.weightage.subjects.map((s) => ({
    name: s.subject,
    value: s.percentage,
    color:
      s.subject === "PHYSICS"
        ? "#0eb4d5"
        : s.subject === "CHEMISTRY"
        ? "#a556f6"
        : "#0066b3",
  }));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "falling":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
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

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high":
        return <Badge variant="success">High Confidence</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 mx-auto flex-wrap">
        <TabsTrigger value="chapter-importance" className="gap-1">
          <BookOpen className="w-4 h-4" /> Chapter Importance
        </TabsTrigger>
        <TabsTrigger value="predictions" className="gap-1">
          <Brain className="w-4 h-4" /> Predictions
        </TabsTrigger>
        <TabsTrigger value="difficulty" className="gap-1">
          <BarChart3 className="w-4 h-4" /> Difficulty
        </TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="weightage">Weightage</TabsTrigger>
        <TabsTrigger value="roi" className="gap-1">
          <Target className="w-4 h-4" /> High ROI
        </TabsTrigger>
      </TabsList>

      {/* CHAPTER IMPORTANCE TAB */}
      <TabsContent value="chapter-importance">
        <div className="space-y-6">
          {/* Summary Stats */}
          {data.chapterImportance && (
            <>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-red-400">
                      {data.chapterImportance.subjects.reduce((sum, s) => sum + s.criticalChapters, 0)}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Critical Chapters</p>
                    <p className="text-xs text-red-400/60 mt-1">Must master for high score</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-orange-400">
                      {data.chapterImportance.subjects.reduce((sum, s) => sum + s.highChapters, 0)}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">High Priority</p>
                    <p className="text-xs text-orange-400/60 mt-1">Important for good score</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-400">
                      {data.chapterImportance.subjects.reduce((sum, s) => sum + s.mediumChapters, 0)}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Medium Priority</p>
                    <p className="text-xs text-yellow-400/60 mt-1">Cover after critical topics</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-400">
                      {data.chapterImportance.totalQuestions}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Questions Analyzed</p>
                    <p className="text-xs text-blue-400/60 mt-1">From 5+ years of JEE</p>
                  </CardContent>
                </Card>
              </div>

              {/* Deleted Topics Warning */}
              {data.chapterImportance.deletedTopicsAppearing.length > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-400">Topics Removed from 2024 Syllabus</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">
                          These topics were in old papers but are no longer in the official syllabus:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {data.chapterImportance.deletedTopicsAppearing.map((topic, i) => (
                            <Badge key={i} variant="warning" size="sm">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subject Filter */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedSubject("ALL")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSubject === "ALL"
                      ? "bg-[var(--zenith-primary)] text-white"
                      : "bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:bg-[var(--background-dark)]"
                  }`}
                >
                  All Subjects
                </button>
                {data.chapterImportance.subjects.map((s) => (
                  <button
                    key={s.subject}
                    onClick={() => setSelectedSubject(s.subject)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedSubject === s.subject
                        ? s.subject === "PHYSICS"
                          ? "bg-[var(--zenith-cyan)] text-white"
                          : s.subject === "CHEMISTRY"
                          ? "bg-[var(--zenith-purple)] text-white"
                          : "bg-[var(--zenith-primary)] text-white"
                        : "bg-[var(--background-elevated)] text-[var(--text-secondary)] hover:bg-[var(--background-dark)]"
                    }`}
                  >
                    {s.subject} ({s.totalQuestions})
                  </button>
                ))}
              </div>

              {/* Top Critical Chapters */}
              {selectedSubject === "ALL" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      Top Critical Chapters Across All Subjects
                    </CardTitle>
                    <p className="text-sm text-[var(--text-muted)]">
                      These chapters have the highest weightage and should be your top priority
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ChapterImportanceChart
                      data={data.chapterImportance.topCriticalChapters.map((c) => ({
                        chapter: c.chapter,
                        weightage: c.weightagePercent,
                        importance: c.importance,
                        trend: c.trend,
                        questionCount: c.questionCount,
                      }))}
                      height={400}
                      showTopN={12}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Subject-wise Chapter Breakdown */}
              <div className="grid lg:grid-cols-1 gap-6">
                {data.chapterImportance.subjects
                  .filter((s) => selectedSubject === "ALL" || s.subject === selectedSubject)
                  .map((subjectData) => (
                    <Card key={subjectData.subject}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Badge
                              variant={
                                subjectData.subject === "PHYSICS"
                                  ? "cyan"
                                  : subjectData.subject === "CHEMISTRY"
                                  ? "purple"
                                  : "default"
                              }
                            >
                              {subjectData.subject}
                            </Badge>
                            Chapter-wise Importance
                          </CardTitle>
                          <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded bg-red-500"></span> Critical
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded bg-orange-500"></span> High
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded bg-yellow-500"></span> Medium
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded bg-green-500"></span> Low
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {subjectData.totalQuestions} questions analyzed • {subjectData.criticalChapters} critical, {subjectData.highChapters} high priority chapters
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                          {subjectData.chapters.map((chapter, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg border ${
                                chapter.importance === "CRITICAL"
                                  ? "border-red-500/30 bg-red-500/5"
                                  : chapter.importance === "HIGH"
                                  ? "border-orange-500/30 bg-orange-500/5"
                                  : chapter.importance === "MEDIUM"
                                  ? "border-yellow-500/30 bg-yellow-500/5"
                                  : "border-[var(--border-dark)] bg-[var(--background-elevated)]"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{chapter.chapter}</span>
                                    {chapter.trend === "rising" && (
                                      <TrendingUp className="w-4 h-4 text-green-400" />
                                    )}
                                    {chapter.trend === "falling" && (
                                      <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      variant={
                                        chapter.importance === "CRITICAL"
                                          ? "error"
                                          : chapter.importance === "HIGH"
                                          ? "warning"
                                          : chapter.importance === "MEDIUM"
                                          ? "secondary"
                                          : "success"
                                      }
                                      size="sm"
                                    >
                                      {chapter.importance}
                                    </Badge>
                                    <span className="text-xs text-[var(--text-muted)]">
                                      ~{chapter.averageQuestionsPerYear.toFixed(1)} Qs/year
                                    </span>
                                    {chapter.lastYearCount > 0 && (
                                      <span className="text-xs text-[var(--text-muted)]">
                                        • {chapter.lastYearCount} in latest exam
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold">
                                    {chapter.weightagePercent.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-[var(--text-muted)]">
                                    {chapter.questionCount} questions
                                  </div>
                                </div>
                              </div>
                              {/* Mini sparkline for yearly trend */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className="text-xs text-[var(--text-muted)]">Trend:</span>
                                <Sparkline
                                  data={chapter.yearlyData.map((y) => y.count)}
                                  color={
                                    chapter.trend === "rising"
                                      ? "#22c55e"
                                      : chapter.trend === "falling"
                                      ? "#ef4444"
                                      : "#6b7280"
                                  }
                                />
                                <span className="text-xs text-[var(--text-muted)]">
                                  {chapter.yearlyData.map((y) => y.year).join(" → ")}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </>
          )}

          {!data.chapterImportance && (
            <div className="text-center py-20 text-[var(--text-muted)]">
              <p>Chapter importance data not available. Please check back later.</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* PREDICTIONS TAB */}
      <TabsContent value="predictions">
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-400">
                  {data.predictions?.insights?.highConfidencePredictions || 0}
                </div>
                <p className="text-sm text-[var(--text-muted)]">High Confidence Predictions</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-400">
                  {data.predictions?.insights?.totalAnalyzedTopics || 0}
                </div>
                <p className="text-sm text-[var(--text-muted)]">Topics Analyzed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-400">
                  {data.predictions?.insights?.yearsCovered?.length || 0} Years
                </div>
                <p className="text-sm text-[var(--text-muted)]">Data Coverage</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Topics Likely to Appear
                </CardTitle>
                <p className="text-sm text-[var(--text-muted)]">
                  Based on historical patterns and gap analysis
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {data.predictions?.topicPredictions?.slice(0, 12).map((pred, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-[var(--border-dark)] bg-[var(--background-elevated)]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{pred.topic}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {pred.chapter} | {pred.subject}
                          </p>
                        </div>
                        {getConfidenceBadge(pred.confidence)}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">{pred.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span>Gap: {pred.gapYears} years</span>
                        <span>History: {pred.historicalFrequency}x</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-[var(--text-muted)] text-center py-10">
                      No predictions available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chapter-wise Expected Questions</CardTitle>
                <p className="text-sm text-[var(--text-muted)]">
                  Predicted distribution for upcoming exam
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {data.predictions?.chapterPredictions?.slice(0, 12).map((pred, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-dark)] bg-[var(--background-elevated)]"
                    >
                      <div>
                        <p className="font-medium text-sm">{pred.chapter}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getSubjectColor(pred.subject) as "default" | "cyan" | "purple" | "secondary"} size="sm">
                            {pred.subject.slice(0, 3)}
                          </Badge>
                          {pred.trend === "increasing" && (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          )}
                          {pred.trend === "decreasing" && (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{pred.expectedQuestions}</p>
                        <p className="text-xs text-[var(--text-muted)]">expected</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-[var(--text-muted)] text-center py-10">
                      No chapter predictions available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* DIFFICULTY TAB */}
      <TabsContent value="difficulty">
        <div className="space-y-6">
          {data.difficulty?.overallStats && (
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-400">
                    {data.difficulty.overallStats.easyCount}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Easy Questions</p>
                  <p className="text-xs text-green-400/60">
                    {((data.difficulty.overallStats.easyCount / data.difficulty.overallStats.totalQuestions) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-400">
                    {data.difficulty.overallStats.mediumCount}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Medium Questions</p>
                  <p className="text-xs text-yellow-400/60">
                    {((data.difficulty.overallStats.mediumCount / data.difficulty.overallStats.totalQuestions) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-400">
                    {data.difficulty.overallStats.hardCount}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Hard Questions</p>
                  <p className="text-xs text-red-400/60">
                    {((data.difficulty.overallStats.hardCount / data.difficulty.overallStats.totalQuestions) * 100).toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-400">
                    {data.difficulty.overallStats.totalQuestions}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">Total Analyzed</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hardest Chapters</CardTitle>
                <p className="text-sm text-[var(--text-muted)]">
                  Chapters with highest proportion of hard questions
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.difficulty?.chapterDifficulty?.slice(0, 10).map((chapter, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-[var(--border-dark)] bg-[var(--background-elevated)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{chapter.chapter}</p>
                          <Badge variant={getSubjectColor(chapter.subject) as "default" | "cyan" | "purple" | "secondary"} size="sm">
                            {chapter.subject}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-400">
                            {(chapter.hardRatio * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">hard</p>
                        </div>
                      </div>
                      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-[var(--background-dark)]">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${(chapter.easy / chapter.totalQuestions) * 100}%` }}
                        />
                        <div
                          className="bg-yellow-500 h-full"
                          style={{ width: `${(chapter.medium / chapter.totalQuestions) * 100}%` }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(chapter.hard / chapter.totalQuestions) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-[var(--text-muted)]">
                        <span>Easy: {chapter.easy}</span>
                        <span>Medium: {chapter.medium}</span>
                        <span>Hard: {chapter.hard}</span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-[var(--text-muted)] text-center py-10">
                      No difficulty data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Difficulty Profiles</CardTitle>
                <p className="text-sm text-[var(--text-muted)]">
                  Difficulty distribution by subject
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.difficulty?.subjectProfiles?.map((profile, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getSubjectColor(profile.subject) as "default" | "cyan" | "purple" | "secondary"}>
                          {profile.subject}
                        </Badge>
                        <span className="text-sm text-[var(--text-muted)]">
                          {profile.totalQuestions} questions
                        </span>
                      </div>
                      <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-[var(--background-dark)]">
                        <div
                          className="bg-green-500 h-full flex items-center justify-center text-xs font-medium"
                          style={{ width: `${profile.easyPercentage}%` }}
                        >
                          {profile.easyPercentage > 15 && `${profile.easyPercentage.toFixed(0)}%`}
                        </div>
                        <div
                          className="bg-yellow-500 h-full flex items-center justify-center text-xs font-medium"
                          style={{ width: `${profile.mediumPercentage}%` }}
                        >
                          {profile.mediumPercentage > 15 && `${profile.mediumPercentage.toFixed(0)}%`}
                        </div>
                        <div
                          className="bg-red-500 h-full flex items-center justify-center text-xs font-medium"
                          style={{ width: `${profile.hardPercentage}%` }}
                        >
                          {profile.hardPercentage > 15 && `${profile.hardPercentage.toFixed(0)}%`}
                        </div>
                      </div>
                      {profile.hardestChapters.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-[var(--text-muted)] mb-1">Hardest chapters:</p>
                          <div className="flex flex-wrap gap-1">
                            {profile.hardestChapters.slice(0, 3).map((ch, idx) => (
                              <Badge key={idx} variant="error" size="sm">
                                {ch.chapter} ({(ch.hardRatio * 100).toFixed(0)}%)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )) || (
                    <p className="text-[var(--text-muted)] text-center py-10">
                      No subject profiles available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* TRENDS TAB */}
      <TabsContent value="trends">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Trends (2020-2024)</CardTitle>
            </CardHeader>
            <CardContent>
              {trendChartData.length > 0 ? (
                <TrendChart data={trendChartData} height={300} />
              ) : (
                <p className="text-[var(--text-muted)] text-center py-10">
                  No trend data available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Trending Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.conceptTrends.slice(0, 8).map((concept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--border-dark)]"
                  >
                    <div className="flex items-center gap-3">
                      {getTrendIcon(concept.trend)}
                      <div>
                        <p className="font-medium text-sm">{concept.concept}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {concept.chapter}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkline
                        data={concept.yearlyCounts.map((y) => y.count)}
                        color={concept.trend === "rising" ? "#22c55e" : "#ef4444"}
                      />
                      <Badge variant={getSubjectColor(concept.subject) as "default" | "cyan" | "purple" | "secondary"} size="sm">
                        {concept.subject.slice(0, 3)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* WEIGHTAGE TAB */}
      <TabsContent value="weightage">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {weightageChartData.length > 0 ? (
                <WeightageChart data={weightageChartData} height={300} />
              ) : (
                <p className="text-[var(--text-muted)] text-center py-10">
                  No weightage data available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chapter Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {data.weightage.subjects.map((subject) => (
                  <div key={subject.subject}>
                    <p className="font-semibold mb-2 text-[var(--text-primary)]">
                      {subject.subject}
                    </p>
                    <div className="space-y-2">
                      {subject.chapters.slice(0, 5).map((chapter, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1 bg-[var(--background-elevated)] rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)]"
                              style={{ width: `${chapter.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-muted)] min-w-[40px]">
                            {chapter.percentage.toFixed(1)}%
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">
                            {chapter.chapter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* ROI TAB */}
      <TabsContent value="roi">
        <Card>
          <CardHeader>
            <CardTitle>High ROI Topics</CardTitle>
            <p className="text-sm text-[var(--text-muted)]">
              Topics with the best return on investment (frequency x scoring potential)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.roiConcepts.slice(0, 12).map((concept, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-[var(--border-dark)] bg-[var(--background-elevated)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={
                        concept.recommendation === "high" ? "success" : "warning"
                      }
                      size="sm"
                    >
                      {concept.recommendation === "high" ? "High ROI" : "Medium ROI"}
                    </Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      #{index + 1}
                    </span>
                  </div>
                  <p className="font-medium mb-1">{concept.concept}</p>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    {concept.chapter}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant={getSubjectColor(concept.subject) as "default" | "cyan" | "purple" | "secondary"} size="sm">
                      {concept.subject}
                    </Badge>
                    <span className="text-[var(--text-secondary)]">
                      {concept.frequency} questions
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {data.roiConcepts.length === 0 && (
              <p className="text-[var(--text-muted)] text-center py-10">
                No ROI data available
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
