"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";

interface MetricsTotals {
  patients: number;
  providers: number;
  encounters: number;
  claims: number;
}

interface DashboardMetricsProps {
  totals: MetricsTotals;
  isLoading: boolean;
  error: string;
}

export function DashboardMetrics({ totals, isLoading, error }: DashboardMetricsProps) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading metrics...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="Total Patients" value={String(totals.patients)} subtitle="Across connected organizations" />
      <StatsCard title="Providers" value={String(totals.providers)} subtitle="Active provider records" />
      <StatsCard title="Encounters" value={String(totals.encounters)} subtitle="Last 30 days" />
      <StatsCard title="Claims" value={String(totals.claims)} subtitle="Current claims in system" />
    </section>
  );
}
