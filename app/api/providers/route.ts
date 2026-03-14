import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface ProviderPayload {
  provider_code?: string;
  name?: string;
  specialty?: string;
  organization?: string;
  patients_managed?: number;
  status?: "active" | "onboarding" | "inactive";
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const status = url.searchParams.get("status");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 8 });

  let query = supabase
    .from("providers")
    .select("id, provider_code, name, specialty, organization, patients_managed, status", { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,provider_code.ilike.%${search}%,specialty.ilike.%${search}%`);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    providers: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as ProviderPayload;

    if (!body.provider_code || !body.name || !body.specialty || !body.organization || !body.status) {
      return NextResponse.json(
        { error: "provider_code, name, specialty, organization, and status are required." },
        { status: 400 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("providers")
      .insert({
        provider_code: body.provider_code,
        name: body.name,
        specialty: body.specialty,
        organization: body.organization,
        patients_managed: body.patients_managed ?? 0,
        status: body.status
      })
      .select("id, provider_code, name, specialty, organization, patients_managed, status")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ provider: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create provider." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const providerCode = url.searchParams.get("providerCode");

  if (!providerCode) {
    return NextResponse.json({ error: "Missing providerCode query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as ProviderPayload;

    const updatePayload: Record<string, string | number> = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.specialty !== undefined) updatePayload.specialty = body.specialty;
    if (body.organization !== undefined) updatePayload.organization = body.organization;
    if (body.patients_managed !== undefined) updatePayload.patients_managed = body.patients_managed;
    if (body.status !== undefined) updatePayload.status = body.status;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("providers")
      .update(updatePayload)
      .eq("provider_code", providerCode)
      .select("id, provider_code, name, specialty, organization, patients_managed, status")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ provider: data });
  } catch {
    return NextResponse.json({ error: "Unable to update provider." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const providerCode = url.searchParams.get("providerCode");

  if (!providerCode) {
    return NextResponse.json({ error: "Missing providerCode query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("providers").delete().eq("provider_code", providerCode);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}