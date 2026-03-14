"use client";

import { ClaimTable } from "@/components/claims/ClaimTable";

export default function ClaimsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Claims</h1>
        <p className="text-sm text-muted-foreground">Manage insurance claims and billing</p>
      </div>
      <ClaimTable />
    </div>
  );
}
