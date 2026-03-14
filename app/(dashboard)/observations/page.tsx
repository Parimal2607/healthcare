import { ObservationTable } from "@/components/observations/ObservationTable";

export default function ObservationsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Observations</h1>
      <ObservationTable />
    </div>
  );
}
