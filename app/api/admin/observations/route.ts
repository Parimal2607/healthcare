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
      return NextResponse.json({ observations: [] });
    }

    const { data, error: queryError } = await supabase
      .from("observations")
      .select("id, observation_code, patient_id, type, value, unit, date")
      .eq("patient_id", patient.id)
      .order("date", { ascending: false });

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    return NextResponse.json({ observations: data ?? [] });
  }

  const { data, error: queryError } = await supabase
    .from("observations")
    .select("id, observation_code, patient_id, type, value, unit, date")
    .order("date", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ observations: data ?? [] });
}
