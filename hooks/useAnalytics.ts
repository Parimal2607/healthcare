import { useEffect, useState } from "react";

interface TotalsApiResponse {
  totals?: {
    patients: number;
    providers: number;
    encounters: number;
    claims: number;
  };
  error?: string;
}

interface PatientsApiResponse {
  patients?: Array<{ age: number; created_at: string }>;
}

interface EncountersApiResponse {
  encounters?: Array<{ type: "Inpatient" | "Outpatient" | "Emergency" }>;
}

interface ClaimsApiResponse {
  claims?: Array<{ status: "Approved" | "Pending" | "Denied" }>;
}

interface ProvidersApiResponse {
  providers?: Array<{ name: string; patients_managed: number }>;
}

interface ChartPoint {
  name: string;
  value: number;
}

interface GrowthPoint {
  month: string;
  patients: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildPatientGrowth(patients: Array<{ created_at: string }>): GrowthPoint[] {
  const now = new Date();
  const points: GrowthPoint[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const current = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = current.getMonth();
    const year = current.getFullYear();

    const count = patients.filter((patient) => {
      const created = new Date(patient.created_at);
      return created.getMonth() === monthIndex && created.getFullYear() === year;
    }).length;

    points.push({
      month: MONTHS[monthIndex],
      patients: count
    });
  }

  let cumulative = 0;
  return points.map((point) => {
    cumulative += point.patients;
    return { ...point, patients: cumulative };
  });
}

export function useAnalytics() {
  const [patientGrowthData, setPatientGrowthData] = useState<GrowthPoint[]>([]);
  const [encounterDistributionData, setEncounterDistributionData] = useState<ChartPoint[]>([]);
  const [claimsAnalyticsData, setClaimsAnalyticsData] = useState<ChartPoint[]>([]);
  const [patientDemographicsData, setPatientDemographicsData] = useState<ChartPoint[]>([]);
  const [providerActivityData, setProviderActivityData] = useState<ChartPoint[]>([]);
  const [totals, setTotals] = useState({ patients: 0, providers: 0, encounters: 0, claims: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [totalsRes, patientsRes, encountersRes, claimsRes, providersRes] = await Promise.all([
          fetch("/api/analytics", { cache: "no-store" }),
          fetch("/api/patients", { cache: "no-store" }),
          fetch("/api/encounters", { cache: "no-store" }),
          fetch("/api/claims", { cache: "no-store" }),
          fetch("/api/providers", { cache: "no-store" })
        ]);

        const totalsPayload = (await totalsRes.json()) as TotalsApiResponse;
        const patientsPayload = (await patientsRes.json()) as PatientsApiResponse;
        const encountersPayload = (await encountersRes.json()) as EncountersApiResponse;
        const claimsPayload = (await claimsRes.json()) as ClaimsApiResponse;
        const providersPayload = (await providersRes.json()) as ProvidersApiResponse;

        const failed = [totalsRes, patientsRes, encountersRes, claimsRes, providersRes].some((response) => !response.ok);

        if (failed) {
          if (isMounted) {
            setError(totalsPayload.error ?? "Unable to load analytics data.");
          }
          return;
        }

        if (!isMounted) return;

        const patients = patientsPayload.patients ?? [];
        const encounters = encountersPayload.encounters ?? [];
        const claims = claimsPayload.claims ?? [];
        const providers = providersPayload.providers ?? [];

        setTotals(totalsPayload.totals ?? { patients: 0, providers: 0, encounters: 0, claims: 0 });
        setPatientGrowthData(buildPatientGrowth(patients));

        const encounterMap: Record<string, number> = { Inpatient: 0, Outpatient: 0, Emergency: 0 };
        encounters.forEach((item) => {
          encounterMap[item.type] = (encounterMap[item.type] ?? 0) + 1;
        });
        setEncounterDistributionData(Object.entries(encounterMap).map(([name, value]) => ({ name, value })));

        const claimsMap: Record<string, number> = { Approved: 0, Pending: 0, Denied: 0 };
        claims.forEach((item) => {
          claimsMap[item.status] = (claimsMap[item.status] ?? 0) + 1;
        });
        setClaimsAnalyticsData(Object.entries(claimsMap).map(([name, value]) => ({ name, value })));

        const demographicMap: Record<string, number> = { "18-30": 0, "31-45": 0, "46-60": 0, "60+": 0 };
        patients.forEach((patient) => {
          if (patient.age <= 30) demographicMap["18-30"] += 1;
          else if (patient.age <= 45) demographicMap["31-45"] += 1;
          else if (patient.age <= 60) demographicMap["46-60"] += 1;
          else demographicMap["60+"] += 1;
        });
        setPatientDemographicsData(Object.entries(demographicMap).map(([name, value]) => ({ name, value })));

        setProviderActivityData(
          providers.slice(0, 6).map((provider) => ({
            name: provider.name,
            value: provider.patients_managed
          }))
        );
      } catch {
        if (isMounted) setError("Unable to load analytics data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    patientGrowthData,
    encounterDistributionData,
    claimsAnalyticsData,
    patientDemographicsData,
    providerActivityData,
    totals,
    isLoading,
    error
  };
}

