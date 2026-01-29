import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Target,
  ArrowRight,
  Sparkles,
  BookOpen,
  Brain,
} from "lucide-react";
import { InsightsSection } from "./insights-section";

export const metadata: Metadata = {
  title: "JEE Main Chapter Wise Weightage 2025 - Physics, Chemistry, Maths",
  description:
    "JEE Main 2025 chapter wise weightage for Physics, Chemistry & Maths. Know high weightage topics like Calculus, Organic Chemistry, Modern Physics. AI analysis of 500+ JEE questions. Free preparation guide.",
  alternates: {
    canonical: "/jee-intelligence",
  },
  openGraph: {
    title: "JEE Main Chapter Wise Weightage 2025 | Physics, Chemistry, Maths",
    description:
      "Complete JEE Main 2025 chapter wise weightage. High weightage topics, rising concepts & important chapters. Based on 5 years of NTA JEE analysis.",
  },
  keywords: [
    "JEE Main chapter wise weightage 2025",
    "JEE Main Physics weightage",
    "JEE Main Chemistry weightage",
    "JEE Main Maths weightage",
    "high weightage chapters JEE",
    "important topics JEE Main 2025",
  ],
};

export const revalidate = 3600; // Revalidate every hour

export default function JEEIntelligencePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--zenith-primary)]/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--zenith-cyan)]/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="cyan" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Intelligence
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">JEE Pulse</span>
            </h1>

            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Unlock AI-driven insights from 5+ years of JEE Main & Advanced papers.
              Know exactly what to study and where to focus your preparation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/diagnostic">
                <Button variant="gradient" size="xl">
                  Take Free Diagnostic
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <a href="#insights">
                <Button variant="outline" size="xl">
                  <BarChart2 className="w-5 h-5 mr-2" />
                  Explore Insights
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-[var(--border-dark)] bg-[var(--background-card)]">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[var(--zenith-cyan)]">5+</p>
              <p className="text-sm text-[var(--text-muted)]">Years of Data</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[var(--zenith-purple)]">500+</p>
              <p className="text-sm text-[var(--text-muted)]">Questions Analyzed</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[var(--zenith-primary)]">100+</p>
              <p className="text-sm text-[var(--text-muted)]">Concepts Tracked</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-green-400">95%</p>
              <p className="text-sm text-[var(--text-muted)]">Prediction Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You&apos;ll Discover
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Our AI analyzes years of JEE papers to give you actionable intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hover glow="cyan">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[var(--zenith-cyan)]/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[var(--zenith-cyan)]" />
                </div>
                <CardTitle>Rising Concepts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Identify concepts appearing more frequently in recent exams.
                  Stay ahead by focusing on trending topics.
                </p>
              </CardContent>
            </Card>

            <Card hover glow="primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[var(--zenith-primary)]/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-[var(--zenith-primary)]" />
                </div>
                <CardTitle>High ROI Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Focus on concepts with the best return on investment.
                  Maximize marks with minimum preparation time.
                </p>
              </CardContent>
            </Card>

            <Card hover glow="accent">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[var(--zenith-purple)]/10 flex items-center justify-center mb-4">
                  <BarChart2 className="w-6 h-6 text-[var(--zenith-purple)]" />
                </div>
                <CardTitle>Chapter Weightage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Know exactly how much each chapter contributes.
                  Prioritize your study schedule effectively.
                </p>
              </CardContent>
            </Card>

            <Card hover glow="cyan">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle>Difficulty Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Understand the difficulty distribution of questions.
                  Prepare for easy, medium, and hard questions strategically.
                </p>
              </CardContent>
            </Card>

            <Card hover glow="primary">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                  <TrendingDown className="w-6 h-6 text-yellow-400" />
                </div>
                <CardTitle>Declining Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Save time by deprioritizing topics that are asked less frequently.
                  Focus where it matters most.
                </p>
              </CardContent>
            </Card>

            <Card hover glow="accent">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[var(--zenith-accent)]/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-[var(--zenith-accent)]" />
                </div>
                <CardTitle>Study Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-secondary)]">
                  Get a personalized study plan based on exam patterns.
                  Cover high-priority topics systematically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="py-16 md:py-24 bg-[var(--background-card)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Live JEE Insights
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Real-time analysis of JEE patterns from 2020-2024
            </p>
          </div>

          <InsightsSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Weak Spots?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Take our free 12-question diagnostic test and get a personalized
              analysis of your JEE readiness in just 10 minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/diagnostic">
                <Button variant="gradient" size="xl">
                  Start Free Diagnostic
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-[var(--text-muted)]">
              No credit card required. Get instant results with personalized recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
