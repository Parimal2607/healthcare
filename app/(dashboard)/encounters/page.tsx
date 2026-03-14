import { EncounterTable } from "@/components/encounters/EncounterTable";

export default function EncountersPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Encounters</h1>
      <EncounterTable />
    </div>
  );
}
