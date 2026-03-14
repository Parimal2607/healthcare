"use client";

import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DashboardPage() {
  const { totals, isLoading, error } = useAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your healthcare metrics</p>
      </div>
      <DashboardMetrics totals={totals} isLoading={isLoading} error={error} />
      <AnalyticsCharts />
    </div>
  );
}
