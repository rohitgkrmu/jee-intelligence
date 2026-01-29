import { Metadata } from "next";
import Link from "next/link";
import {
  BarChart2,
  ClipboardList,
  BookOpen,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "JEE Weightage - Free JEE Mains Mock Test & Chapter Weightage Analysis 2025",
  description:
    "Free JEE Mains full mock test with 90 questions, 3-hour timer. AI-powered chapter weightage analysis, PYQ browser, and diagnostic tests. Prepare smarter for JEE 2025.",
  keywords: [
    "JEE Mains mock test",
    "JEE chapter weightage",
    "JEE 2025 preparation",
    "free JEE test",
    "JEE Main practice",
    "JEE weightage analysis",
  ],
};

const features = [
  {
    href: "/mock-test",
    icon: ClipboardList,
    title: "Full Mock Test",
    subtitle: "90 Questions • 3 Hours",
    description:
      "Complete JEE Mains simulation with NTA-style interface. Real PYQs, instant scoring, detailed analysis.",
    cta: "Start Free Mock Test",
    highlight: true,
    color: "from-[var(--zenith-primary)] to-[var(--zenith-cyan)]",
  },
  {
    href: "/jee-intelligence",
    icon: BarChart2,
    title: "Weightage Analysis",
    subtitle: "AI-Powered Insights",
    description:
      "Chapter-wise weightage trends, high-yield topics, and predictive analysis from 500+ questions.",
    cta: "View Analysis",
    color: "from-[var(--zenith-cyan)] to-[var(--zenith-purple)]",
  },
  {
    href: "/diagnostic",
    icon: Sparkles,
    title: "Quick Diagnostic",
    subtitle: "12 Questions • 10 Minutes",
    description:
      "Quick assessment to identify your strengths and weak areas. Get personalized study recommendations.",
    cta: "Take Diagnostic",
    color: "from-[var(--zenith-purple)] to-[var(--zenith-accent)]",
  },
  {
    href: "/pyq",
    icon: BookOpen,
    title: "PYQ Browser",
    subtitle: "Previous Year Questions",
    description:
      "Browse and filter JEE questions by year, subject, chapter, and difficulty. Study with solutions.",
    cta: "Browse PYQs",
    color: "from-[var(--zenith-accent)] to-[var(--zenith-primary)]",
  },
];

const stats = [
  { value: "500+", label: "Real PYQs" },
  { value: "90", label: "Mock Questions" },
  { value: "3 hrs", label: "Full Test" },
  { value: "Free", label: "Forever" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--zenith-primary)]/5 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--zenith-cyan)]/10 text-[var(--zenith-cyan)] text-sm font-medium mb-6">
              <Target className="h-4 w-4" />
              JEE Mains 2025 Preparation
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Crack JEE with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--zenith-cyan)] to-[var(--zenith-purple)]">
                Data-Driven
              </span>{" "}
              Preparation
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Free full-length mock tests, AI-powered weightage analysis, and
              smart study tools. Everything you need to maximize your JEE score.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/mock-test"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[var(--zenith-primary)]/25"
              >
                <ClipboardList className="h-5 w-5" />
                Take Free Mock Test
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/jee-intelligence"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[var(--border-light)] text-[var(--text-primary)] font-semibold text-lg hover:bg-[var(--background-elevated)] transition-colors"
              >
                <BarChart2 className="h-5 w-5" />
                View Weightage Analysis
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-[var(--background-card)] border border-[var(--border-dark)]"
                >
                  <p className="text-2xl md:text-3xl font-bold text-[var(--zenith-cyan)]">
                    {stat.value}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for JEE Prep
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Comprehensive tools designed to help you study smarter, not harder.
              All completely free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`group relative p-6 rounded-2xl border transition-all hover:shadow-xl ${
                    feature.highlight
                      ? "bg-gradient-to-br from-[var(--zenith-primary)]/10 to-[var(--zenith-cyan)]/10 border-[var(--zenith-primary)]/30 hover:border-[var(--zenith-primary)]/50"
                      : "bg-[var(--background-card)] border-[var(--border-dark)] hover:border-[var(--border-light)]"
                  }`}
                >
                  {feature.highlight && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full bg-[var(--zenith-primary)] text-white text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-[var(--zenith-cyan)] font-medium mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-[var(--text-secondary)] mb-4">
                    {feature.description}
                  </p>

                  <span className="inline-flex items-center gap-2 text-[var(--zenith-cyan)] font-medium group-hover:gap-3 transition-all">
                    {feature.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 bg-[var(--background-elevated)]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why JEE Weightage?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 text-green-400 mb-4">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">100% Free</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  No hidden charges, no premium plans. All features are free
                  forever.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 mb-4">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Real PYQs</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Practice with actual previous year questions from JEE Mains
                  exams.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 text-purple-400 mb-4">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg mb-2">NTA Interface</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  Experience the exact interface you&apos;ll see on exam day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Preparing?
            </h2>
            <p className="text-[var(--text-secondary)] text-lg mb-8">
              Take your first full-length mock test now and see where you stand.
            </p>
            <Link
              href="/mock-test"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[var(--zenith-primary)]/25"
            >
              <ClipboardList className="h-5 w-5" />
              Start Free Mock Test
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
