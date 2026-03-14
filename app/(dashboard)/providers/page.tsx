import { ProviderTable } from "@/components/providers/ProviderTable";

export default function ProvidersPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Providers</h1>
      <ProviderTable />
    </div>
  );
}

