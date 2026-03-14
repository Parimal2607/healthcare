import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const [patientsRes, providersRes, encountersRes, claimsRes] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("providers").select("id", { count: "exact", head: true }),
    supabase.from("encounters").select("id", { count: "exact", head: true }),
    supabase.from("claims").select("id", { count: "exact", head: true })
  ]);

  const hasError = [patientsRes.error, providersRes.error, encountersRes.error, claimsRes.error].find(Boolean);

  if (hasError) {
    return NextResponse.json({ error: hasError?.message ?? "Unable to load analytics." }, { status: 500 });
  }

  return NextResponse.json({
    totals: {
      patients: patientsRes.count ?? 0,
      providers: providersRes.count ?? 0,
      encounters: encountersRes.count ?? 0,
      claims: claimsRes.count ?? 0
    }
  });
}
