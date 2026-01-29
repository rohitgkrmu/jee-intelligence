import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { QuickInsights } from "./quick-insights";
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
      {/* Hero Section - Compact */}
      <section className="relative overflow-hidden py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--zenith-primary)]/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--zenith-cyan)]/5 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="cyan" className="mb-3">
              <Sparkles className="w-3 h-3 mr-1" />
              500+ JEE Questions Analyzed
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              JEE Main <span className="gradient-text">Chapter Wise Weightage</span> 2025
            </h1>

            <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
              Know exactly which topics to focus on. Our AI analyzed 5 years of JEE papers
              to show you the <strong>high-weightage chapters</strong> and <strong>quick-win topics</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/diagnostic">
                <Button variant="gradient" size="lg">
                  Check My Preparation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="#detailed-analysis">
                <Button variant="outline" size="lg">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  See Full Analysis
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Insights - THE AHA MOMENT */}
      <section id="insights" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <QuickInsights />
        </div>
      </section>

      {/* Detailed Analysis Section */}
      <section id="detailed-analysis" className="py-12 md:py-16 bg-[var(--background-card)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Detailed Analysis
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Dive deeper into trends, weightage distribution, and difficulty patterns
            </p>
          </div>

          <InsightsSection />
        </div>
      </section>
    </div>
  );
}
