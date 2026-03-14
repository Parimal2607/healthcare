import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface ConsentPayload {
  consent_code?: string;
  patient_name?: string;
  organization?: string;
  permission?: string;
  status?: "Granted" | "Pending" | "Revoked";
  granted_date?: string;
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 8 });

  let query = supabase
    .from("consents")
    .select("id, consent_code, patient_name, organization, permission, status, granted_date", { count: "exact" })
    .order("granted_date", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`patient_name.ilike.%${search}%,consent_code.ilike.%${search}%,organization.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    consents: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as ConsentPayload;

    if (!body.consent_code || !body.patient_name || !body.organization || !body.permission || !body.status || !body.granted_date) {
      return NextResponse.json(
        { error: "consent_code, patient_name, organization, permission, status and granted_date are required." },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("consents")
      .insert(body)
      .select("id, consent_code, patient_name, organization, permission, status, granted_date")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ consent: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create consent." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const consentCode = url.searchParams.get("consentCode");

  if (!consentCode) {
    return NextResponse.json({ error: "Missing consentCode query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ConsentPayload;
    const updatePayload: Record<string, string> = {};

    if (body.patient_name !== undefined) updatePayload.patient_name = body.patient_name;
    if (body.organization !== undefined) updatePayload.organization = body.organization;
    if (body.permission !== undefined) updatePayload.permission = body.permission;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.granted_date !== undefined) updatePayload.granted_date = body.granted_date;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("consents")
      .update(updatePayload)
      .eq("consent_code", consentCode)
      .select("id, consent_code, patient_name, organization, permission, status, granted_date")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ consent: data });
  } catch {
    return NextResponse.json({ error: "Unable to update consent." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const consentCode = url.searchParams.get("consentCode");

  if (!consentCode) {
    return NextResponse.json({ error: "Missing consentCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("consents").delete().eq("consent_code", consentCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}