import { useEffect, useState } from "react";
import type { ConsentRecord } from "@/types/patient.types";

interface ConsentApiRecord {
  consent_code: string;
  patient_name: string;
  organization: string;
  permission: string;
  status: "Granted" | "Pending" | "Revoked";
  granted_date: string;
}

interface ConsentApiResponse {
  consents?: ConsentApiRecord[];
  error?: string;
}

export function useConsents() {
  const [data, setData] = useState<ConsentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/consents", { cache: "no-store" });
        const payload = (await response.json()) as ConsentApiResponse;

        if (!response.ok) {
          if (isMounted) setError(payload.error ?? "Unable to load consents.");
          return;
        }

        if (!isMounted) return;

        setData(
          (payload.consents ?? []).map((item) => ({
            id: item.consent_code,
            patient: item.patient_name,
            organization: item.organization,
            permission: item.permission,
            status: item.status,
            grantedDate: item.granted_date
          }))
        );
      } catch {
        if (isMounted) setError("Unable to load consents.");
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

