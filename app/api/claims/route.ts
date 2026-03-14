import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface ClaimPayload {
  claim_code?: string;
  patient_id?: string;
  patient_code?: string;
  amount?: number;
  status?: "Approved" | "Pending" | "Denied";
  submitted_at?: string;
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
  const status = url.searchParams.get("status");
  const patientCode = url.searchParams.get("patientCode");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 8 });

  let patientIdFilter: string | null = null;
  if (patientCode) {
    patientIdFilter = await resolvePatientId(supabase, patientCode);
    if (!patientIdFilter) {
      return NextResponse.json({
        claims: [],
        pagination: buildPagination(page, pageSize, 0)
      });
    }
  }

  let query = supabase
    .from("claims")
    .select("id, claim_code, patient_id, amount, status, submitted_at", { count: "exact" })
    .order("submitted_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (patientIdFilter) {
    query = query.eq("patient_id", patientIdFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    claims: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as ClaimPayload;
    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));

    if (!body.claim_code || !patientId || body.amount === undefined || !body.status || !body.submitted_at) {
      return NextResponse.json(
        { error: "claim_code, patient_id/patient_code, amount, status and submitted_at are required." },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("claims")
      .insert({
        claim_code: body.claim_code,
        patient_id: patientId,
        amount: body.amount,
        status: body.status,
        submitted_at: body.submitted_at
      })
      .select("id, claim_code, patient_id, amount, status, submitted_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ claim: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create claim." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const claimCode = url.searchParams.get("claimCode");

  if (!claimCode) {
    return NextResponse.json({ error: "Missing claimCode query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ClaimPayload;
    const updatePayload: Record<string, string | number> = {};

    if (body.amount !== undefined) updatePayload.amount = body.amount;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.submitted_at !== undefined) updatePayload.submitted_at = body.submitted_at;

    const patientId = body.patient_id ?? (await resolvePatientId(supabase, body.patient_code));
    if (patientId) updatePayload.patient_id = patientId;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("claims")
      .update(updatePayload)
      .eq("claim_code", claimCode)
      .select("id, claim_code, patient_id, amount, status, submitted_at")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ claim: data });
  } catch {
    return NextResponse.json({ error: "Unable to update claim." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const claimCode = url.searchParams.get("claimCode");

  if (!claimCode) {
    return NextResponse.json({ error: "Missing claimCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("claims").delete().eq("claim_code", claimCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}