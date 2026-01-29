import { Metadata } from "next";
import { MockTestStartForm } from "./start-form";
import { Clock, FileQuestion, Award, Brain, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Free JEE Mains Full Mock Test 2025 - 90 Questions, 3 Hours",
  description:
    "Take free JEE Mains full-length mock test with 90 questions, 3-hour timer, NTA-style navigation. Real PYQs, instant scoring, detailed analysis. Practice like the real exam.",
  alternates: {
    canonical: "/mock-test",
  },
  openGraph: {
    title: "Free JEE Mains Full Mock Test 2025 | 90 Questions | 3 Hours",
    description:
      "Full-length JEE Mains simulation. 30 Physics + 30 Chemistry + 30 Maths questions. NTA-style interface, instant results, AI-powered analysis.",
  },
  keywords: [
    "JEE Mains mock test",
    "JEE Main full test",
    "JEE Main 2025 practice",
    "free JEE test series",
    "JEE Main simulation",
    "NTA JEE mock test",
    "JEE Main 90 questions",
  ],
};

export default function MockTestPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--zenith-primary)]/10 text-[var(--zenith-primary)] text-sm font-medium mb-4">
              <Target className="h-4 w-4" />
              Full-Length Simulation
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              JEE Mains{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--zenith-cyan)] to-[var(--zenith-purple)]">
                Full Mock Test
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
              Experience the real JEE Mains exam with our full-length simulation.
              90 questions, 3-hour timer, NTA-style navigation.
            </p>
          </div>

          {/* Test Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="text-center p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-dark)]">
              <FileQuestion className="h-8 w-8 mx-auto mb-2 text-[var(--zenith-cyan)]" />
              <p className="text-2xl font-bold">90</p>
              <p className="text-xs text-[var(--text-muted)]">Questions</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-dark)]">
              <Clock className="h-8 w-8 mx-auto mb-2 text-[var(--zenith-purple)]" />
              <p className="text-2xl font-bold">3 Hours</p>
              <p className="text-xs text-[var(--text-muted)]">Duration</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-dark)]">
              <Award className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">300</p>
              <p className="text-xs text-[var(--text-muted)]">Max Marks</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-dark)]">
              <Brain className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">Free</p>
              <p className="text-xs text-[var(--text-muted)]">Forever</p>
            </div>
          </div>

          {/* Subject breakdown */}
          <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border-dark)] p-6 mb-10">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--zenith-cyan)]" />
              Test Structure
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--background-elevated)]">
                <div className="font-semibold text-blue-400 mb-2">Physics</div>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>Section A: 20 MCQs (+4/-1)</li>
                  <li>Section B: 10 Numerical (+4/0)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--background-elevated)]">
                <div className="font-semibold text-green-400 mb-2">Chemistry</div>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>Section A: 20 MCQs (+4/-1)</li>
                  <li>Section B: 10 Numerical (+4/0)</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--background-elevated)]">
                <div className="font-semibold text-purple-400 mb-2">Mathematics</div>
                <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                  <li>Section A: 20 MCQs (+4/-1)</li>
                  <li>Section B: 10 Numerical (+4/0)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-xl mx-auto">
            <MockTestStartForm />
          </div>

          {/* Trust indicators */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Real previous year questions. Your data is secure and will only be
            used to provide personalized analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
