import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("consents")
    .select("id, consent_code, patient_name, organization, permission, status, granted_date")
    .order("granted_date", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ consents: data ?? [] });
}
