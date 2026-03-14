import { useEffect, useState } from "react";
import type { Provider } from "@/types/provider.types";

interface ProvidersApiRecord {
  provider_code: string;
  name: string;
  specialty: string;
  organization: string;
  patients_managed: number;
  status: "active" | "onboarding" | "inactive";
}

interface ProvidersApiResponse {
  providers?: ProvidersApiRecord[];
  error?: string;
}

function formatProviderStatus(status: ProvidersApiRecord["status"]): Provider["status"] {
  if (status === "active") return "Active";
  if (status === "onboarding") return "Onboarding";
  return "Inactive";
}

export function useProviders() {
  const [data, setData] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/providers", { cache: "no-store" });
        const payload = (await response.json()) as ProvidersApiResponse;

        if (!response.ok) {
          if (isMounted) setError(payload.error ?? "Unable to load providers.");
          return;
        }

        if (!isMounted) return;

        const mapped: Provider[] = (payload.providers ?? []).map((item) => ({
          id: item.provider_code,
          name: item.name,
          specialty: item.specialty,
          organization: item.organization,
          patientsManaged: item.patients_managed,
          status: formatProviderStatus(item.status)
        }));

        setData(mapped);
      } catch {
        if (isMounted) setError("Unable to load providers.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}

