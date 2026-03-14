import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface PatientPayload {
  patient_code?: string;
  name?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  last_visit?: string | null;
  status?: "Active" | "Critical" | "Inactive";
  provider_id?: string | null;
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const gender = url.searchParams.get("gender");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 8 });

  let query = supabase
    .from("patients")
    .select("id, patient_code, name, age, gender, last_visit, status, provider_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,patient_code.ilike.%${search}%`);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (gender && gender !== "all") {
    query = query.eq("gender", gender);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    patients: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as PatientPayload;

    if (!body.patient_code || !body.name || !body.age || !body.gender || !body.status) {
      return NextResponse.json({ error: "patient_code, name, age, gender, and status are required." }, { status: 400 });
    }

    const { data, error: insertError } = await supabase
      .from("patients")
      .insert({
        patient_code: body.patient_code,
        name: body.name,
        age: body.age,
        gender: body.gender,
        last_visit: body.last_visit ?? null,
        status: body.status,
        provider_id: body.provider_id ?? null
      })
      .select("id, patient_code, name, age, gender, last_visit, status, provider_id, created_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ patient: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create patient." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const patientCode = url.searchParams.get("patientCode");

  if (!patientCode) {
    return NextResponse.json({ error: "Missing patientCode query parameter." }, { status: 400 });
  }

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
      .eq("patient_code", patientCode)
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

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const patientCode = url.searchParams.get("patientCode");

  if (!patientCode) {
    return NextResponse.json({ error: "Missing patientCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("patients").delete().eq("patient_code", patientCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}