export type PatientStatus = "Active" | "Inactive" | "Critical";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  lastVisit: string;
  status: PatientStatus;
  providerId: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  type: "Inpatient" | "Outpatient" | "Emergency";
  date: string;
  summary: string;
}

export interface Observation {
  id: string;
  patientId: string;
  title: string;
  value: string;
  status: "Normal" | "Attention";
  date: string;
}

export interface ConsentRecord {
  id: string;
  patient: string;
  organization: string;
  permission: string;
  status: "Granted" | "Pending" | "Revoked";
  grantedDate: string;
}
