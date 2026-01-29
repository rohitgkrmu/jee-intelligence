"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsightsSection } from "./insights-section";

export function CollapsibleAnalysis() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Default expanded on desktop, collapsed on mobile
    setIsExpanded(window.innerWidth >= 768);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section id="detailed-analysis" className="py-12 md:py-16 bg-[var(--background-card)]">
      <div className="container mx-auto px-4">
        {/* Header with toggle */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Chapter-wise Analysis
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
            Complete breakdown of chapter importance, weightage, and trends across Physics, Chemistry & Maths
          </p>

          {/* Toggle button - shown on all devices */}
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <BarChart2 className="w-4 h-4" />
            {isExpanded ? "Hide" : "Show"} Detailed Analysis
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <InsightsSection />
        </div>

        {/* Teaser when collapsed */}
        {!isExpanded && (
          <div className="text-center py-8 border border-dashed border-[var(--border-dark)] rounded-xl bg-[var(--background-elevated)]">
            <p className="text-[var(--text-muted)] mb-4">
              Explore chapter importance, difficulty patterns, predictions, and high-ROI chapters for each subject
            </p>
            <Button
              variant="ghost"
              onClick={() => setIsExpanded(true)}
              className="text-[var(--zenith-cyan)]"
            >
              Show Chapter Analysis
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
