import type { Observation } from "@/types/patient.types";

export const observations: Observation[] = [
  { id: "OB-100", patientId: "PT-1001", title: "Blood Pressure", value: "128/84 mmHg", status: "Normal", date: "2026-03-03" },
  { id: "OB-101", patientId: "PT-1002", title: "Heart Rate", value: "112 bpm", status: "Attention", date: "2026-03-10" },
  { id: "OB-102", patientId: "PT-1002", title: "Troponin", value: "0.09 ng/mL", status: "Attention", date: "2026-03-10" },
  { id: "OB-103", patientId: "PT-1003", title: "HbA1c", value: "5.6 %", status: "Normal", date: "2026-02-24" }
];
