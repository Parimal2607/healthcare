"use client";

import { ConsentTable } from "@/components/consent/ConsentTable";

export default function ConsentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Consent</h1>
        <p className="text-sm text-muted-foreground">Manage patient consent records</p>
      </div>
      <ConsentTable />
    </div>
  );
}
