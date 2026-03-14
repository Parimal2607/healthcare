import { NextResponse } from "next/server";
import { requireAdmin, requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface PlatformIntegrationPayload {
  platform?: "Epic" | "Cerner" | "Allscripts" | "FHIR Sandbox";
  environment?: "sandbox" | "staging" | "production";
  baseUrl?: string;
  clientId?: string;
  connectionMode?: "oauth2" | "api_key" | "service_account";
  status?: "Connected" | "Syncing" | "Disconnected" | "Error";
  syncFrequency?: "realtime" | "hourly" | "daily" | "weekly";
  isEnabled?: boolean;
}

function mapRow(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    platform: row.platform as string,
    environment: row.environment as string,
    baseUrl: row.base_url as string,
    clientId: row.client_id as string,
    connectionMode: row.connection_mode as string,
    status: row.status as string,
    syncFrequency: row.sync_frequency as string,
    isEnabled: row.is_enabled as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string
  };
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const platform = url.searchParams.get("platform");
  const environment = url.searchParams.get("environment");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 6 });

  let query = supabase
    .from("platform_integrations")
    .select(
      "id, platform, environment, base_url, client_id, connection_mode, status, sync_frequency, is_enabled, created_at, updated_at",
      { count: "exact" }
    )
    .order("updated_at", { ascending: false });

  if (platform && platform !== "all") query = query.eq("platform", platform);
  if (environment && environment !== "all") query = query.eq("environment", environment);
  if (status && status !== "all") query = query.eq("status", status);
  if (search) query = query.or(`platform.ilike.%${search}%,client_id.ilike.%${search}%`);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json(
      {
        error:
          "Unable to fetch platform integrations. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    integrations: (data ?? []).map((item) => mapRow(item as Record<string, unknown>)),
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function POST(request: Request) {
  const { error, supabase, user } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as PlatformIntegrationPayload;

    if (!body.platform || !body.environment || !body.baseUrl || !body.clientId) {
      return NextResponse.json(
        { error: "platform, environment, baseUrl and clientId are required." },
        { status: 400 }
      );
    }

    const payload = {
      platform: body.platform,
      environment: body.environment,
      base_url: body.baseUrl,
      client_id: body.clientId,
      connection_mode: body.connectionMode ?? "oauth2",
      status: body.status ?? "Disconnected",
      sync_frequency: body.syncFrequency ?? "daily",
      is_enabled: body.isEnabled ?? true,
      updated_by: user.id
    };

    const { data, error: insertError } = await supabase
      .from("platform_integrations")
      .insert(payload)
      .select(
        "id, platform, environment, base_url, client_id, connection_mode, status, sync_frequency, is_enabled, created_at, updated_at"
      )
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ integration: mapRow(data as Record<string, unknown>) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create platform integration." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { error, supabase, user } = await requireManagerOrAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as PlatformIntegrationPayload;
    const payload: Record<string, string | boolean> = { updated_by: user.id };

    if (body.platform !== undefined) payload.platform = body.platform;
    if (body.environment !== undefined) payload.environment = body.environment;
    if (body.baseUrl !== undefined) payload.base_url = body.baseUrl;
    if (body.clientId !== undefined) payload.client_id = body.clientId;
    if (body.connectionMode !== undefined) payload.connection_mode = body.connectionMode;
    if (body.status !== undefined) payload.status = body.status;
    if (body.syncFrequency !== undefined) payload.sync_frequency = body.syncFrequency;
    if (body.isEnabled !== undefined) payload.is_enabled = body.isEnabled;

    const { data, error: updateError } = await supabase
      .from("platform_integrations")
      .update(payload)
      .eq("id", id)
      .select(
        "id, platform, environment, base_url, client_id, connection_mode, status, sync_frequency, is_enabled, created_at, updated_at"
      )
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ integration: mapRow(data as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "Unable to update platform integration." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter." }, { status: 400 });
  }

  const { error: deleteError } = await supabase.from("platform_integrations").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}