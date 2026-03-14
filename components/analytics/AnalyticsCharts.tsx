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

  return (
    <section className="grid gap-3 lg:grid-cols-2">
      <AnalyticsChart title="Patient Demographics" type="pie" data={patientDemographicsData} valueKey="value" />
      <AnalyticsChart title="Encounter Frequency" type="bar" data={encounterDistributionData} valueKey="value" />
      <AnalyticsChart title="Claim Approval Rate" type="pie" data={claimsAnalyticsData} valueKey="value" />
      <AnalyticsChart title="Provider Activity" type="bar" data={providerActivityData} valueKey="value" />
    </section>
  );
}
