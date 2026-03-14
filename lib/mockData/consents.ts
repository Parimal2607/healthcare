import type { ConsentRecord } from "@/types/patient.types";

export const consents: ConsentRecord[] = [
  { id: "CS-001", patient: "Emma Carter", organization: "Mercy Health Network", permission: "Share CCD", status: "Granted", grantedDate: "2026-02-10" },
  { id: "CS-002", patient: "Noah Bennett", organization: "Northwell Partners", permission: "Claims Access", status: "Pending", grantedDate: "2026-03-08" },
  { id: "CS-003", patient: "Olivia Brooks", organization: "CityCare Group", permission: "FHIR API Read", status: "Granted", grantedDate: "2026-01-22" }
];
