"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, TrendingUp, Gift } from "lucide-react";

export function SocialProof() {
  return (
    <section className="py-12 md:py-16 bg-[var(--background-elevated)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Testimonial */}
          <div className="text-center mb-10">
            <blockquote className="text-xl md:text-2xl font-medium italic text-[var(--text-primary)] mb-4">
              &ldquo;I wish I had this before my JEE attempt. Would have saved months of studying wrong chapters.&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-2 text-[var(--text-secondary)]">
              <span className="font-medium">— Arjun S.</span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="text-sm">JEE 2024 AIR 847</span>
            </div>

            {/* Star rating */}
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm text-[var(--text-secondary)]">
                4.8/5 from 500+ students
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-[var(--background-card)] border-[var(--border-dark)]">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-[var(--zenith-cyan)]/10 mb-3">
                  <Users className="w-6 h-6 text-[var(--zenith-cyan)]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  2,400+
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Students using
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--background-card)] border-[var(--border-dark)]">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  85%
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Improved focus
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[var(--background-card)] border-[var(--border-dark)]">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex p-3 rounded-full bg-purple-500/10 mb-3">
                  <Gift className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  Free
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Forever
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
