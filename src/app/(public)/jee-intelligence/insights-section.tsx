"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendChart } from "@/components/charts/trend-chart";
import { WeightageChart } from "@/components/charts/weightage-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

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

export function InsightsSection() {
  const [activeTab, setActiveTab] = useState("trends");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    conceptTrends: ConceptTrend[];
    subjectTrends: SubjectTrend[];
    weightage: { subjects: SubjectWeightage[] };
    roiConcepts: ROIConcept[];
    risingConcepts: ConceptTrend[];
    fallingConcepts: ConceptTrend[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendsRes, weightageRes, roiRes, risingRes] = await Promise.all([
          fetch("/api/insights/trends"),
          fetch("/api/insights/weightage"),
          fetch("/api/insights/roi"),
          fetch("/api/insights/rising-concepts"),
        ]);

        const [trends, weightage, roi, rising] = await Promise.all([
          trendsRes.json(),
          weightageRes.json(),
          roiRes.json(),
          risingRes.json(),
        ]);

        setData({
          conceptTrends: trends.conceptTrends || [],
          subjectTrends: trends.subjectTrends || [],
          weightage: weightage.weightage || { subjects: [] },
          roiConcepts: roi.conceptROI || [],
          risingConcepts: rising.risingConcepts || [],
          fallingConcepts: rising.fallingConcepts || [],
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

  // Prepare chart data
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-8 mx-auto">
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="weightage">Weightage</TabsTrigger>
        <TabsTrigger value="rising">Rising Topics</TabsTrigger>
        <TabsTrigger value="roi">High ROI</TabsTrigger>
      </TabsList>

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

      <TabsContent value="rising">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Rising Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.risingConcepts.slice(0, 10).map((concept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5"
                  >
                    <div>
                      <p className="font-medium text-sm">{concept.concept}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {concept.chapter} | {concept.subject}
                      </p>
                    </div>
                    <Badge variant="success">
                      +{(concept.slope * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
                {data.risingConcepts.length === 0 && (
                  <p className="text-[var(--text-muted)] text-center py-10">
                    No rising concepts found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                Declining Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.fallingConcepts.slice(0, 10).map((concept, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                  >
                    <div>
                      <p className="font-medium text-sm">{concept.concept}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {concept.chapter} | {concept.subject}
                      </p>
                    </div>
                    <Badge variant="error">
                      {(concept.slope * 100).toFixed(0)}%
                    </Badge>
                  </div>
                ))}
                {data.fallingConcepts.length === 0 && (
                  <p className="text-[var(--text-muted)] text-center py-10">
                    No declining concepts found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="roi">
        <Card>
          <CardHeader>
            <CardTitle>High ROI Topics</CardTitle>
            <p className="text-sm text-[var(--text-muted)]">
              Topics with the best return on investment (frequency × scoring potential)
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
