"use client";

import { EncounterTable } from "@/components/encounters/EncounterTable";

export default function EncountersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Encounters</h1>
        <p className="text-sm text-muted-foreground">View and manage patient encounters</p>
      </div>
      <EncounterTable />
    </div>
  );
}
