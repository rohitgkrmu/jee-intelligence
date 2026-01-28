"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, CircularProgress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Share2,
  Copy,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  MessageCircle,
} from "lucide-react";

interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
  percentage: number;
}

interface StudyPlanItem {
  day: number;
  concept: string;
  chapter: string;
  subject: string;
  priority: string;
  reason: string;
}

interface ReportData {
  attemptId: string;
  reportToken: string;
  leadName: string;
  leadEmail: string;
  completedAt: string;
  readinessScore: number;
  readinessLabel: string;
  totalCorrect: number;
  totalQuestions: number;
  subjectScores: SubjectScore[];
  strengthConcepts: string[];
  weaknessConcepts: string[];
  studyPlan: StudyPlanItem[];
  nextSteps: string[];
}

export function ReportView({
  report,
  token,
}: {
  report: ReportData;
  token: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/report/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/report/${token}`;
    const text = `I just took the JEE Readiness Diagnostic by ZenithSchool.ai and scored ${report.readinessScore}%! Check it out:`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      "_blank"
    );
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "gradient";
    if (score >= 40) return "warning";
    return "error";
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return "#0eb4d5";
      case "CHEMISTRY":
        return "#a556f6";
      case "MATHEMATICS":
        return "#0066b3";
      default:
        return "#64748b";
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="cyan" className="mb-4">
            JEE Readiness Report
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hi {report.leadName.split(" ")[0]}!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Here&apos;s your personalized JEE readiness assessment
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Generated on {new Date(report.completedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Main Score Card */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <CircularProgress
                  value={report.readinessScore}
                  size={160}
                  strokeWidth={12}
                  variant={getScoreVariant(report.readinessScore)}
                  label="Score"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">
                  {report.readinessLabel}
                </h2>
                <p className="text-[var(--text-secondary)] mb-4">
                  You answered {report.totalCorrect} out of {report.totalQuestions}{" "}
                  questions correctly.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleWhatsAppShare}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[var(--zenith-cyan)]" />
              Subject Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {report.subjectScores.map((score) => (
                <div key={score.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{score.subject}</span>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {score.correct}/{score.total} ({Math.round(score.percentage)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score.percentage}%`,
                        backgroundColor: getSubjectColor(score.subject),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.strengthConcepts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {report.strengthConcepts.map((concept, index) => (
                    <Badge key={index} variant="success">
                      {concept}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">
                  Complete more questions to identify your strengths.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <Target className="w-5 h-5" />
                Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.weaknessConcepts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {report.weaknessConcepts.map((concept, index) => (
                    <Badge key={index} variant="error">
                      {concept}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">
                  Great job! No major weaknesses identified.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Study Plan */}
        {report.studyPlan.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--zenith-purple)]" />
                14-Day Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {report.studyPlan.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border",
                      item.priority === "high"
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-[var(--border-dark)] bg-[var(--background-elevated)]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        item.priority === "high"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-[var(--zenith-cyan)]/20 text-[var(--zenith-cyan)]"
                      )}
                    >
                      {item.day}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.concept}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {item.chapter} | {item.subject}
                      </p>
                    </div>
                    <Badge
                      variant={item.priority === "high" ? "error" : "secondary"}
                      size="sm"
                    >
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--zenith-cyan)]" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--zenith-cyan)]/10 text-[var(--zenith-cyan)] flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-[var(--text-secondary)]">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-[var(--zenith-primary)]/20 to-[var(--zenith-cyan)]/20 border-[var(--zenith-cyan)]/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Ace JEE?
            </h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">
              Join Zenith&apos;s AI-powered JEE coaching program and get personalized
              learning paths, expert guidance, and unlimited doubt support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://zenithschool.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gradient" size="lg">
                  Join Zenith JEE Program
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>
              <Link href="/jee-intelligence">
                <Button variant="outline" size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore JEE Insights
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-8">
          This report was generated by ZenithSchool.ai&apos;s JEE Intelligence system.
          <br />
          Results are based on a limited diagnostic and should be used as guidance only.
        </p>
      </div>
    </div>
  );
}
