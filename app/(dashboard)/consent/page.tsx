import { ConsentTable } from "@/components/consent/ConsentTable";

export default function ConsentPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Consent</h1>
      <ConsentTable />
    </div>
  );
}

