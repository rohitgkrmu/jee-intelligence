"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendChart } from "@/components/charts/trend-chart";
import { WeightageChart } from "@/components/charts/weightage-chart";
import {
  Users,
  FileText,
  TrendingUp,
  BarChart2,
  Loader2,
} from "lucide-react";

interface Stats {
  totalQuestions: number;
  totalLeads: number;
  totalAttempts: number;
  completedAttempts: number;
  avgScore: number;
}

export default function InsightsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch question stats
        const questionRes = await fetch("/api/questions/stats");
        const questionData = await questionRes.json();

        // For demo purposes, using static data
        // In production, you'd have a dedicated stats endpoint
        setStats({
          totalQuestions: questionData.totalQuestions || 0,
          totalLeads: 0, // Would come from API
          totalAttempts: 0,
          completedAttempts: 0,
          avgScore: 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-[var(--text-muted)]">
          Overview of your JEE Intelligence platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Questions</p>
                <p className="text-3xl font-bold">{stats?.totalQuestions || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--zenith-primary)]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[var(--zenith-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Total Leads</p>
                <p className="text-3xl font-bold">{stats?.totalLeads || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--zenith-cyan)]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[var(--zenith-cyan)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">
                  Diagnostic Attempts
                </p>
                <p className="text-3xl font-bold">{stats?.totalAttempts || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--zenith-purple)]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[var(--zenith-purple)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Avg Score</p>
                <p className="text-3xl font-bold">{stats?.avgScore || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Cards */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/admin/questions/new"
                className="block p-4 rounded-lg border border-[var(--border-dark)] hover:border-[var(--zenith-cyan)] transition-colors"
              >
                <p className="font-medium">Add New Question</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Add questions to the question bank
                </p>
              </a>
              <a
                href="/admin/import"
                className="block p-4 rounded-lg border border-[var(--border-dark)] hover:border-[var(--zenith-cyan)] transition-colors"
              >
                <p className="font-medium">Import Questions</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Bulk import from CSV or JSON
                </p>
              </a>
              <a
                href="/admin/leads"
                className="block p-4 rounded-lg border border-[var(--border-dark)] hover:border-[var(--zenith-cyan)] transition-colors"
              >
                <p className="font-medium">Export Leads</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Download leads as CSV
                </p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Database</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Question Bank
                </span>
                <Badge
                  variant={
                    (stats?.totalQuestions || 0) > 0 ? "success" : "warning"
                  }
                >
                  {(stats?.totalQuestions || 0) > 0 ? "Ready" : "Empty"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">
                  Diagnostic Items
                </span>
                <Badge variant="secondary">Check DB</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">API Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Setup Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--zenith-cyan)]/10 flex items-center justify-center text-[var(--zenith-cyan)] font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-medium">Create Dataset Sources</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Run the seed script or manually create dataset sources in the
                  database for JEE Main and Advanced.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--zenith-cyan)]/10 flex items-center justify-center text-[var(--zenith-cyan)] font-bold shrink-0">
                2
              </div>
              <div>
                <p className="font-medium">Import Historical Questions</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Use the import feature to bulk upload JEE questions from CSV
                  or JSON files.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--zenith-cyan)]/10 flex items-center justify-center text-[var(--zenith-cyan)] font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-medium">Add Diagnostic Items</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Create Zenith-authored diagnostic questions that will be used
                  for the assessment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[var(--zenith-cyan)]/10 flex items-center justify-center text-[var(--zenith-cyan)] font-bold shrink-0">
                4
              </div>
              <div>
                <p className="font-medium">Test the Flow</p>
                <p className="text-sm text-[var(--text-muted)]">
                  Take a diagnostic test yourself to ensure everything works
                  correctly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
