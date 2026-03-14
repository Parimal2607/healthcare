"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type ChartType = "line" | "bar" | "pie";

interface AnalyticsChartProps {
  title: string;
  type: ChartType;
  data: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const pieColors = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted-foreground))"
];

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].name}: {payload[0].value}</p>
    </div>
  );
}

function SectionLegend({ children }: { children: ReactNode }) {
  return <div className="pt-2 text-xs text-muted-foreground">{children}</div>;
}

export function AnalyticsChart({ title, type, data, valueKey, labelKey = "name" }: AnalyticsChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <XAxis dataKey={labelKey} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey={valueKey} stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          ) : type === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 4" />
              <XAxis dataKey={labelKey} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={{ stroke: "hsl(var(--border))" }} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey={valueKey} fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} maxBarSize={44} />
            </BarChart>
          ) : (
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 16 }}>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
              <Pie data={data} dataKey={valueKey} nameKey={labelKey} innerRadius={64} outerRadius={102} paddingAngle={2}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${String(entry[labelKey])}-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
        {/* <SectionLegend>
          {type === "line" && "Trend over time"}
          {type === "bar" && "Category comparison"}
          {type === "pie" && "Distribution by segment"}
        </SectionLegend> */}
      </CardContent>
    </Card>
  );
}