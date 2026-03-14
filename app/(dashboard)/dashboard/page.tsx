"use client";

import { useSearchParams } from "next/navigation";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { patientGrowthData, encounterDistributionData, claimsAnalyticsData, totals, isLoading, error } = useAnalytics();

  const isForbiddenNotice = searchParams.get("forbidden") === "1";

  return (
    <div className="space-y-3">
      {isForbiddenNotice ? (
        <p className="text-sm text-destructive">You do not have permission to access that page.</p>
      ) : null}
      <DashboardMetrics totals={totals} isLoading={isLoading} error={error} />
      {isLoading ? <p className="text-sm text-muted-foreground">Loading charts...</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {!isLoading && !error ? (
        <section className="grid gap-3 lg:grid-cols-2">
          <AnalyticsChart title="Patient Growth" type="line" data={patientGrowthData} valueKey="patients" labelKey="month" />
          <AnalyticsChart title="Encounter Distribution" type="bar" data={encounterDistributionData} valueKey="value" labelKey="name" />
          <div className="lg:col-span-2">
            <AnalyticsChart title="Claims Analytics" type="pie" data={claimsAnalyticsData} valueKey="value" labelKey="name" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
