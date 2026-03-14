import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface IntegrationPayload {
  vendor?: string;
  status?: "Connected" | "Syncing" | "Disconnected";
  last_sync?: string | null;
  health?: "Healthy" | "Warning" | "Critical";
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const health = url.searchParams.get("health");
  const search = url.searchParams.get("search");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 9 });

  let query = supabase
    .from("integrations")
    .select("id, vendor, status, last_sync, health", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (health && health !== "all") {
    query = query.eq("health", health);
  }

  if (search) {
    query = query.ilike("vendor", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    integrations: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as IntegrationPayload;

    if (!body.vendor || !body.status || !body.health) {
      return NextResponse.json({ error: "vendor, status and health are required." }, { status: 400 });
    }

    const { data, error: insertError } = await supabase
      .from("integrations")
      .insert({
        vendor: body.vendor,
        status: body.status,
        last_sync: body.last_sync ?? null,
        health: body.health
      })
      .select("id, vendor, status, last_sync, health")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create integration." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const vendor = url.searchParams.get("vendor");

  if (!vendor) {
    return NextResponse.json({ error: "Missing vendor query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as IntegrationPayload;
    const updatePayload: Record<string, string | null> = {};

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.last_sync !== undefined) updatePayload.last_sync = body.last_sync;
    if (body.health !== undefined) updatePayload.health = body.health;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }

    const { data, error: updateError } = await supabase
      .from("integrations")
      .update(updatePayload)
      .eq("vendor", vendor)
      .select("id, vendor, status, last_sync, health")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ integration: data });
  } catch {
    return NextResponse.json({ error: "Unable to update integration." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const vendor = url.searchParams.get("vendor");

  if (!vendor) {
    return NextResponse.json({ error: "Missing vendor query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("integrations").delete().eq("vendor", vendor);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}