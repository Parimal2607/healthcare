"use client";

import { ProviderTable } from "@/components/providers/ProviderTable";

export default function ProvidersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Providers</h1>
        <p className="text-sm text-muted-foreground">Manage healthcare provider records</p>
      </div>
      <ProviderTable />
    </div>
  );
}
