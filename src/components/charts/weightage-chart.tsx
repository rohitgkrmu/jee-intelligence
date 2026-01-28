"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WeightageChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  height?: number;
  horizontal?: boolean;
}

const DEFAULT_COLORS = ["#0eb4d5", "#a556f6", "#0066b3", "#ed1c24", "#22c55e"];

export function WeightageChart({
  data,
  height = 300,
  horizontal = false,
}: WeightageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        {horizontal ? (
          <>
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748b"
              fontSize={12}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f8fafc",
          }}
          formatter={(value) => [`${Number(value).toFixed(1)}%`, "Weightage"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
