import { useEffect, useState } from "react";
import type { Patient } from "@/types/patient.types";

interface PatientsApiRecord {
  patient_code: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  last_visit: string | null;
  status: "Active" | "Critical" | "Inactive";
  provider_id: string | null;
}

interface PatientsApiResponse {
  patients?: PatientsApiRecord[];
  error?: string;
}

export function usePatients() {
  const [data, setData] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/patients", { cache: "no-store" });
        const payload = (await response.json()) as PatientsApiResponse;

        if (!response.ok) {
          if (isMounted) setError(payload.error ?? "Unable to load patients.");
          return;
        }

        if (!isMounted) return;

        const mapped: Patient[] = (payload.patients ?? []).map((item) => ({
          id: item.patient_code,
          name: item.name,
          age: item.age,
          gender: item.gender,
          lastVisit: item.last_visit ?? "-",
          status: item.status,
          providerId: item.provider_id ?? ""
        }));

        setData(mapped);
      } catch {
        if (isMounted) setError("Unable to load patients.");
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

