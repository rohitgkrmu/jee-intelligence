"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ChapterData {
  chapter: string;
  weightage: number;
  importance: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "MINIMAL";
  trend: "rising" | "falling" | "stable";
  questionCount: number;
}

interface ChapterImportanceChartProps {
  data: ChapterData[];
  height?: number;
  showTopN?: number;
}

const importanceColors: Record<string, string> = {
  CRITICAL: "#ef4444", // red
  HIGH: "#f97316", // orange
  MEDIUM: "#eab308", // yellow
  LOW: "#22c55e", // green
  MINIMAL: "#6b7280", // gray
};

interface ChartDataItem {
  name: string;
  fullName: string;
  weightage: number;
  importance: string;
  trend: string;
  questionCount: number;
}

export function ChapterImportanceChart({
  data,
  height = 400,
  showTopN = 15,
}: ChapterImportanceChartProps) {
  const chartData: ChartDataItem[] = data.slice(0, showTopN).map((d) => ({
    name: d.chapter.length > 20 ? d.chapter.slice(0, 18) + "..." : d.chapter,
    fullName: d.chapter,
    weightage: parseFloat(d.weightage.toFixed(1)),
    importance: d.importance,
    trend: d.trend,
    questionCount: d.questionCount,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customTooltipFormatter = (value: any, _name: any, props: any) => {
    const payload = props?.payload as ChartDataItem | undefined;
    return [`${value}% (${payload?.questionCount || 0} Qs)`, "Weightage"];
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customLabelFormatter = (_label: any, payload: any) => {
    const item = payload?.[0]?.payload as ChartDataItem | undefined;
    return item?.fullName || "";
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis
          type="number"
          domain={[0, "auto"]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "var(--text-muted)", fontSize: 12 }}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={95}
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background-elevated)",
            border: "1px solid var(--border-dark)",
            borderRadius: "8px",
          }}
          formatter={customTooltipFormatter}
          labelFormatter={customLabelFormatter}
        />
        <Bar dataKey="weightage" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={importanceColors[entry.importance] || "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
