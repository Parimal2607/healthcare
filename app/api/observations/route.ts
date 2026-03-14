import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface ObservationPayload {
  observation_code?: string;
  patient_id?: string;
  patient_code?: string;
  type?: string;
  value?: string;
  unit?: string | null;
  date?: string;
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
        observations: [],
        pagination: buildPagination(page, pageSize, 0)
      });
    }
  }

  let query = supabase
    .from("observations")
    .select("id, observation_code, patient_id, type, value, unit, date", { count: "exact" })
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
    observations: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as ObservationPayload;
    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));

    if (!body.observation_code || !patientId || !body.type || !body.value || !body.date) {
      return NextResponse.json(
        { error: "observation_code, patient_id/patient_code, type, value and date are required." },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("observations")
      .insert({
        observation_code: body.observation_code,
        patient_id: patientId,
        type: body.type,
        value: body.value,
        unit: body.unit ?? null,
        date: body.date
      })
      .select("id, observation_code, patient_id, type, value, unit, date")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ observation: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create observation." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const observationCode = url.searchParams.get("observationCode");

  if (!observationCode) {
    return NextResponse.json({ error: "Missing observationCode query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ObservationPayload;
    const updatePayload: Record<string, string | null> = {};

    if (body.type !== undefined) updatePayload.type = body.type;
    if (body.value !== undefined) updatePayload.value = body.value;
    if (body.unit !== undefined) updatePayload.unit = body.unit;
    if (body.date !== undefined) updatePayload.date = body.date;

    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));
    if (patientId) updatePayload.patient_id = patientId;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("observations")
      .update(updatePayload)
      .eq("observation_code", observationCode)
      .select("id, observation_code, patient_id, type, value, unit, date")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ observation: data });
  } catch {
    return NextResponse.json({ error: "Unable to update observation." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const observationCode = url.searchParams.get("observationCode");

  if (!observationCode) {
    return NextResponse.json({ error: "Missing observationCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("observations").delete().eq("observation_code", observationCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}