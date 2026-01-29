import { Metadata } from "next";
import { DiagnosticStartForm } from "./start-form";

export const metadata: Metadata = {
  title: "Free JEE Diagnostic Test - Check Your JEE Readiness in 10 Minutes",
  description:
    "Take our free 12-question JEE diagnostic test. Assess your Physics, Chemistry & Maths preparation in 10 minutes. Get instant AI-powered analysis and personalized study recommendations.",
  alternates: {
    canonical: "/diagnostic",
  },
  openGraph: {
    title: "Free JEE Diagnostic Test - Check Your Readiness",
    description:
      "12-question JEE diagnostic test. Get instant AI analysis and personalized study plan in 10 minutes. 100% free.",
  },
};

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              JEE Readiness Diagnostic
            </h1>
            <p className="text-[var(--text-secondary)]">
              Discover your strengths and weaknesses with our AI-powered
              diagnostic test. Get personalized study recommendations.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)]">
              <p className="text-2xl font-bold text-[var(--zenith-cyan)]">12</p>
              <p className="text-xs text-[var(--text-muted)]">Questions</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)]">
              <p className="text-2xl font-bold text-[var(--zenith-purple)]">10</p>
              <p className="text-xs text-[var(--text-muted)]">Minutes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)]">
              <p className="text-2xl font-bold text-green-400">Free</p>
              <p className="text-xs text-[var(--text-muted)]">Forever</p>
            </div>
          </div>

          {/* Form */}
          <DiagnosticStartForm />

          {/* Trust indicators */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-6">
            Your data is secure and will only be used to provide you with
            personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
