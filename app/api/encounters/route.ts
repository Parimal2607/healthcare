import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface EncounterPayload {
  encounter_code?: string;
  patient_id?: string;
  patient_code?: string;
  type?: "Inpatient" | "Outpatient" | "Emergency";
  date?: string;
  summary?: string;
}

async function resolvePatientId(supabase: Awaited<ReturnType<typeof requireAuthenticated>>["supabase"], patientCode?: string) {
  if (!patientCode) return null;
  const { data } = await supabase.from("patients").select("id").eq("patient_code", patientCode).maybeSingle();
  return data?.id ?? null;
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const patientCode = url.searchParams.get("patientCode");
  const type = url.searchParams.get("type");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 8 });

  let patientIdFilter: string | null = null;
  if (patientCode) {
    patientIdFilter = await resolvePatientId(supabase, patientCode);
    if (!patientIdFilter) {
      return NextResponse.json({
        encounters: [],
        pagination: buildPagination(page, pageSize, 0)
      });
    }
  }

  let query = supabase
    .from("encounters")
    .select("id, encounter_code, patient_id, type, date, summary", { count: "exact" })
    .order("date", { ascending: false });

  if (patientIdFilter) {
    query = query.eq("patient_id", patientIdFilter);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    encounters: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as EncounterPayload;
    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));

    if (!body.encounter_code || !patientId || !body.type || !body.date || !body.summary) {
      return NextResponse.json(
        { error: "encounter_code, patient_id/patient_code, type, date and summary are required." },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("encounters")
      .insert({
        encounter_code: body.encounter_code,
        patient_id: patientId,
        type: body.type,
        date: body.date,
        summary: body.summary
      })
      .select("id, encounter_code, patient_id, type, date, summary")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ encounter: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create encounter." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const encounterCode = url.searchParams.get("encounterCode");

  if (!encounterCode) {
    return NextResponse.json({ error: "Missing encounterCode query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as EncounterPayload;
    const updatePayload: Record<string, string> = {};

    if (body.type !== undefined) updatePayload.type = body.type;
    if (body.date !== undefined) updatePayload.date = body.date;
    if (body.summary !== undefined) updatePayload.summary = body.summary;

    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));
    if (patientId) updatePayload.patient_id = patientId;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("encounters")
      .update(updatePayload)
      .eq("encounter_code", encounterCode)
      .select("id, encounter_code, patient_id, type, date, summary")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ encounter: data });
  } catch {
    return NextResponse.json({ error: "Unable to update encounter." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const encounterCode = url.searchParams.get("encounterCode");

  if (!encounterCode) {
    return NextResponse.json({ error: "Missing encounterCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("encounters").delete().eq("encounter_code", encounterCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}