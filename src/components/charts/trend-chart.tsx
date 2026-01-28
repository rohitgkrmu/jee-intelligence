"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TrendChartProps {
  data: {
    year: number;
    physics?: number;
    chemistry?: number;
    mathematics?: number;
  }[];
  height?: number;
}

export function TrendChart({ data, height = 300 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="year"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f8fafc",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="physics"
          name="Physics"
          stroke="#0eb4d5"
          strokeWidth={2}
          dot={{ fill: "#0eb4d5", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="chemistry"
          name="Chemistry"
          stroke="#a556f6"
          strokeWidth={2}
          dot={{ fill: "#a556f6", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="mathematics"
          name="Mathematics"
          stroke="#0066b3"
          strokeWidth={2}
          dot={{ fill: "#0066b3", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
