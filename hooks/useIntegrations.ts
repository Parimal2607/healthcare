import { useEffect, useState } from "react";

export interface IntegrationItem {
  name: string;
  status: "Connected" | "Pending" | "Issue";
  lastSync: string;
  health: string;
}

interface IntegrationApiRecord {
  vendor: string;
  status: "Connected" | "Syncing" | "Disconnected";
  last_sync: string | null;
  health: "Healthy" | "Warning" | "Critical";
}

interface IntegrationApiResponse {
  integrations?: IntegrationApiRecord[];
  error?: string;
}

function mapStatus(status: IntegrationApiRecord["status"]): IntegrationItem["status"] {
  if (status === "Connected") return "Connected";
  if (status === "Syncing") return "Pending";
  return "Issue";
}

export function useIntegrations() {
  const [data, setData] = useState<IntegrationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/integrations", { cache: "no-store" });
        const payload = (await response.json()) as IntegrationApiResponse;

        if (!response.ok) {
          if (isMounted) setError(payload.error ?? "Unable to load integrations.");
          return;
        }

        if (!isMounted) return;

        setData(
          (payload.integrations ?? []).map((item) => ({
            name: item.vendor,
            status: mapStatus(item.status),
            lastSync: item.last_sync ? new Date(item.last_sync).toLocaleString() : "Never",
            health: item.health
          }))
        );
      } catch {
        if (isMounted) setError("Unable to load integrations.");
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

