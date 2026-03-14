"use client";

import { ObservationTable } from "@/components/observations/ObservationTable";

export default function ObservationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Observations</h1>
        <p className="text-sm text-muted-foreground">Manage clinical observations and measurements</p>
      </div>
      <ObservationTable />
    </div>
  );
}
