import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("patients")
    .select("id, patient_code, name, age, gender, last_visit, status, provider_id, created_at")
    .eq("patient_code", params.id)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ patient: data });
}
