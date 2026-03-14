"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PatientProfile } from "@/components/patients/PatientProfile";
import { PatientTimeline } from "@/components/patients/PatientTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Patient } from "@/types/patient.types";

interface PatientApiRecord {
  patient_code: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  last_visit: string | null;
  status: "Active" | "Critical" | "Inactive";
  provider_id: string | null;
}

interface EncounterApiRecord {
  encounter_code: string;
  type: string;
  date: string;
  summary: string;
}

interface ObservationApiRecord {
  observation_code: string;
  type: string;
  value: string;
  unit: string | null;
  date: string;
}

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [encounters, setEncounters] = useState<EncounterApiRecord[]>([]);
  const [observations, setObservations] = useState<ObservationApiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const patientCode = useMemo(() => params.id, [params.id]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [patientRes, encountersRes, observationsRes] = await Promise.all([
          fetch(`/api/patients/${patientCode}`, { cache: "no-store" }),
          fetch(`/api/encounters?patientCode=${patientCode}`, { cache: "no-store" }),
          fetch(`/api/observations?patientCode=${patientCode}`, { cache: "no-store" })
        ]);

        const patientPayload = (await patientRes.json()) as { patient?: PatientApiRecord; error?: string };
        const encountersPayload = (await encountersRes.json()) as { encounters?: EncounterApiRecord[]; error?: string };
        const observationsPayload = (await observationsRes.json()) as { observations?: ObservationApiRecord[]; error?: string };

        if (!patientRes.ok) {
          if (isMounted) setError(patientPayload.error ?? "Unable to load patient.");
          return;
        }

        if (!encountersRes.ok || !observationsRes.ok) {
          if (isMounted) setError(encountersPayload.error ?? observationsPayload.error ?? "Unable to load patient details.");
          return;
        }

        if (!isMounted || !patientPayload.patient) return;

        setPatient({
          id: patientPayload.patient.patient_code,
          name: patientPayload.patient.name,
          age: patientPayload.patient.age,
          gender: patientPayload.patient.gender,
          lastVisit: patientPayload.patient.last_visit ?? "-",
          status: patientPayload.patient.status,
          providerId: patientPayload.patient.provider_id ?? ""
        });

        setEncounters(encountersPayload.encounters ?? []);
        setObservations(observationsPayload.observations ?? []);
      } catch {
        if (isMounted) setError("Unable to load patient details.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [patientCode]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading patient details...</p>;
  }

  if (error || !patient) {
    return <p className="text-sm text-destructive">{error || "Patient not found."}</p>;
  }

  return (
    <div className="space-y-3">
      <PatientProfile patient={patient} />
      <PatientTimeline
        events={encounters.map((item) => ({
          id: item.encounter_code,
          type: item.type,
          date: item.date,
          summary: item.summary
        }))}
      />
      <Card>
        <CardHeader>
          <CardTitle>Medical Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Observation</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observations.map((observation) => (
                <TableRow key={observation.observation_code}>
                  <TableCell>{observation.type}</TableCell>
                  <TableCell>{observation.value}</TableCell>
                  <TableCell>{observation.unit ?? "-"}</TableCell>
                  <TableCell>{observation.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

