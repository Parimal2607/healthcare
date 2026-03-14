import type { Encounter } from "@/types/patient.types";

export const encounters: Encounter[] = [
  { id: "EN-9001", patientId: "PT-1001", type: "Outpatient", date: "2026-03-03", summary: "Blood pressure follow-up." },
  { id: "EN-9002", patientId: "PT-1002", type: "Emergency", date: "2026-03-10", summary: "Acute chest pain assessment." },
  { id: "EN-9003", patientId: "PT-1003", type: "Outpatient", date: "2026-02-24", summary: "Annual wellness check." },
  { id: "EN-9004", patientId: "PT-1002", type: "Inpatient", date: "2026-03-11", summary: "Observation and monitoring." }
];
