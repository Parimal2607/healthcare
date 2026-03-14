import { ClaimTable } from "@/components/claims/ClaimTable";

export default function ClaimsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold text-foreground">Claims</h1>
      <ClaimTable />
    </div>
  );
}
