import { Metadata } from "next";
import { HeroHook } from "./hero-hook";
import { SubjectTeasers } from "./subject-teasers";
import { ChapterHighlights } from "./chapter-highlights";
import { SocialProof } from "./social-proof";
import { CTAStrip } from "./cta-strip";
import { CollapsibleAnalysis } from "./collapsible-analysis";

export const metadata: Metadata = {
  title: "JEE Main Chapter Wise Weightage 2026 - Physics, Chemistry, Maths | Critical Chapters",
  description:
    "JEE Main 2026 chapter wise weightage analysis. Find critical chapters for Physics (Mechanics 16%, Optics 9%), Chemistry (Organic 23%), Maths (Calculus 18%). Based on 1100+ JEE questions analysis.",
  alternates: {
    canonical: "/jee-intelligence",
  },
  openGraph: {
    title: "JEE Main Chapter Wise Weightage 2026 | Critical & High Priority Chapters",
    description:
      "Complete JEE Main 2026 chapter importance analysis. Know which 12 critical chapters carry 60%+ weightage. Based on analysis of 1100+ JEE questions from 2020-2026.",
  },
  keywords: [
    "JEE Main chapter wise weightage 2026",
    "JEE Main Physics weightage",
    "JEE Main Chemistry weightage",
    "JEE Main Maths weightage",
    "critical chapters JEE",
    "high weightage chapters JEE Main",
    "important chapters JEE Main 2026",
    "JEE chapter importance",
  ],
};

export const revalidate = 3600; // Revalidate every hour

export default function JEEIntelligencePage() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero - The Hook */}
      <HeroHook />

      {/* 2. Subject Teasers - Quick subject overview */}
      <SubjectTeasers />

      {/* 3. Chapter Highlights - Top critical chapters */}
      <ChapterHighlights />

      {/* 4. Social Proof - Build Trust */}
      <SocialProof />

      {/* 5. CTA Strip - The Convert */}
      <CTAStrip />

      {/* 6. Detailed Analysis - For Browsers (Collapsible) */}
      <CollapsibleAnalysis />
    </div>
  );
}
