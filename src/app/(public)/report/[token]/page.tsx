import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportView } from "./report-view";

export const metadata: Metadata = {
  title: "Your JEE Readiness Report",
  description:
    "View your personalized JEE readiness assessment, subject-wise analysis, and AI-powered study recommendations.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

async function getReport(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/report/${token}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error("Error fetching report:", error);
    return null;
  }
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await getReport(token);

  if (!report) {
    notFound();
  }

  return <ReportView report={report} token={token} />;
}
