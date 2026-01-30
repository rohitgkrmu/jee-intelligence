import { Metadata } from "next";
import { HeroHook } from "./hero-hook";
import { SubjectTeasers } from "./subject-teasers";
import { ChapterHighlights } from "./chapter-highlights";
import { ExamComparison } from "./exam-comparison";
import { SocialProof } from "./social-proof";
import { CTAStrip } from "./cta-strip";
import { CollapsibleAnalysis } from "./collapsible-analysis";

export const metadata: Metadata = {
  title: "JEE Main & Advanced Chapter Wise Weightage 2026 - Physics, Chemistry, Maths",
  description:
    "JEE Main & Advanced 2026 chapter wise weightage comparison. Find critical chapters for Physics (Mechanics 16%, Optics 9%), Chemistry (Organic 23%), Maths (Calculus 18%). Based on 1400+ JEE questions analysis.",
  alternates: {
    canonical: "/jee-intelligence",
  },
  openGraph: {
    title: "JEE Main vs Advanced Chapter Weightage 2026 | Critical Chapters Comparison",
    description:
      "Complete JEE Main & Advanced chapter importance comparison. Know which chapters matter more in each exam. Based on analysis of 1400+ JEE questions from 2019-2026.",
  },
  keywords: [
    "JEE Main chapter wise weightage 2026",
    "JEE Advanced chapter wise weightage 2026",
    "JEE Main vs Advanced comparison",
    "JEE Main Physics weightage",
    "JEE Advanced Physics weightage",
    "JEE Main Chemistry weightage",
    "JEE Main Maths weightage",
    "critical chapters JEE",
    "high weightage chapters JEE",
    "important chapters JEE 2026",
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

      {/* 4. JEE Main vs Advanced Comparison */}
      <ExamComparison />

      {/* 5. Social Proof - Build Trust */}
      <SocialProof />

      {/* 6. CTA Strip - The Convert */}
      <CTAStrip />

      {/* 7. Detailed Analysis - For Browsers (Collapsible) */}
      <CollapsibleAnalysis />
    </div>
  );
}
