"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, ArrowRight } from "lucide-react";

interface CTAStripProps {
  variant?: "default" | "compact";
}

export function CTAStrip({ variant = "default" }: CTAStripProps) {
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
            <p className="text-white font-medium">
              Get Your Personalized Chapter Priority List
            </p>
            <Link href="/diagnostic">
              <Button variant="outline" className="bg-white text-[var(--zenith-primary)] border-white hover:bg-white/90 hover:text-[var(--zenith-primary)]">
                Start Diagnostic
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--zenith-primary)] to-[var(--zenith-cyan)] p-8 md:p-12">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative text-center">
            {/* Icon */}
            <div className="inline-flex p-4 rounded-2xl bg-white/10 backdrop-blur mb-6">
              <Target className="w-10 h-10 text-white" />
            </div>

            {/* Copy */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Get Your Personalized Chapter Priority List
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Take a quick diagnostic to find YOUR weak chapters and get AI-powered recommendations tailored to your preparation level.
            </p>

            {/* CTA */}
            <Link href="/diagnostic">
              <Button
                size="xl"
                className="bg-white text-[var(--zenith-primary)] hover:bg-white/90 font-semibold text-lg px-8"
              >
                Start 10-Minute Diagnostic
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            {/* Reassurance */}
            <p className="text-white/60 text-sm mt-4">
              No signup needed &bull; Instant AI analysis &bull; 100% free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
