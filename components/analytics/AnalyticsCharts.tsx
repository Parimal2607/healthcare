"use client";

import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { useAnalytics } from "@/hooks/useAnalytics";

export function AnalyticsCharts() {
  const { patientDemographicsData, encounterDistributionData, claimsAnalyticsData, providerActivityData, isLoading, error } =
    useAnalytics();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  const toChartData = <T,>(d: T[]) => d as unknown as Array<Record<string, string | number>>;

  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <AnalyticsChart title="Patient Demographics" type="pie" data={toChartData(patientDemographicsData)} valueKey="value" />
      <AnalyticsChart title="Encounter Frequency" type="bar" data={toChartData(encounterDistributionData)} valueKey="value" />
      <AnalyticsChart title="Claim Approval Rate" type="pie" data={toChartData(claimsAnalyticsData)} valueKey="value" />
      <AnalyticsChart title="Provider Activity" type="bar" data={toChartData(providerActivityData)} valueKey="value" />
    </section>
  );
}
