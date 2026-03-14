import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const patientCode = url.searchParams.get("patientCode");

  if (patientCode) {
    const { data: patient } = await supabase.from("patients").select("id").eq("patient_code", patientCode).maybeSingle();

    if (!patient) {
      return NextResponse.json({ encounters: [] });
    }

    const { data, error: queryError } = await supabase
      .from("encounters")
      .select("id, encounter_code, patient_id, type, date, summary")
      .eq("patient_id", patient.id)
      .order("date", { ascending: false });

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    return NextResponse.json({ encounters: data ?? [] });
  }

  const { data, error: queryError } = await supabase
    .from("encounters")
    .select("id, encounter_code, patient_id, type, date, summary")
    .order("date", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ encounters: data ?? [] });
}
