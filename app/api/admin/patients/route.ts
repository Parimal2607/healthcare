import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("patients")
    .select("id, patient_code, name, age, gender, last_visit, status, provider_id, created_at")
    .order("created_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ patients: data ?? [] });
}
