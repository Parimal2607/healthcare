import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";

interface PatientPayload {
  name?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  last_visit?: string | null;
  status?: "Active" | "Critical" | "Inactive";
  provider_id?: string | null;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { error, supabase } = await requireAuthenticated();
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as PatientPayload;

    const updatePayload: Record<string, string | number | null> = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.age !== undefined) updatePayload.age = body.age;
    if (body.gender !== undefined) updatePayload.gender = body.gender;
    if (body.last_visit !== undefined) updatePayload.last_visit = body.last_visit;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.provider_id !== undefined) updatePayload.provider_id = body.provider_id;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("patients")
      .update(updatePayload)
      .eq("patient_code", params.id)
      .select("id, patient_code, name, age, gender, last_visit, status, provider_id, created_at")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ patient: data });
  } catch {
    return NextResponse.json({ error: "Unable to update patient." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { error: deleteError } = await supabase.from("patients").delete().eq("patient_code", params.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
