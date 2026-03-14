"use client";

import { PatientTable } from "@/components/patients/PatientTable";

export default function PatientsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Patients</h1>
        <p className="text-sm text-muted-foreground">Manage patient records and profiles</p>
      </div>
      <PatientTable />
    </div>
  );
}
