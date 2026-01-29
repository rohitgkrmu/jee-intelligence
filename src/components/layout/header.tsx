"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart2, ClipboardList, Sparkles, BookOpen } from "lucide-react";

const navLinks = [
  { href: "/jee-intelligence", label: "Weightage Analysis", icon: BarChart2 },
  { href: "/mock-test", label: "Full Mock Test", icon: ClipboardList },
  { href: "/pyq", label: "PYQ Browser", icon: BookOpen },
  { href: "/diagnostic", label: "Quick Diagnostic", icon: Sparkles },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-dark)] bg-[var(--background-dark)]/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--zenith-primary)] to-[var(--zenith-cyan)]">
              <span className="text-lg font-bold text-white">JW</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[var(--text-primary)]">
                JEE<span className="text-[var(--zenith-cyan)]">Weightage</span>
              </span>
            </div>
          </Link>
          <span className="text-[10px] text-[var(--text-muted)] self-end mb-1">
            by <a href="https://zenithschool.ai" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--zenith-cyan)] transition-colors">ZenithSchool.ai</a>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/mock-test">
            <Button variant="gradient" size="md">
              Take Free Mock Test
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-dark)] bg-[var(--background-dark)] animate-slide-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background-elevated)]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-[var(--border-dark)]">
              <Link href="/mock-test" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="gradient" size="lg" className="w-full">
                  Take Free Mock Test
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
