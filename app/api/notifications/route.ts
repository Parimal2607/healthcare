import { NextResponse } from "next/server";
import { requireAuthenticated, requireManagerOrAdmin } from "@/lib/authz";
import { buildPagination, parsePagination } from "@/lib/pagination";

interface NotificationPayload {
  title?: string;
  message?: string;
  category?: "general" | "security" | "claims" | "consent" | "integration" | "system";
  priority?: "low" | "normal" | "high" | "urgent";
  actionUrl?: string | null;
  userId?: string;
}

export async function GET(request: Request) {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const { page, pageSize } = parsePagination(url.searchParams, { pageSize: 10 });

  let query = supabase
    .from("notifications")
    .select("id, title, message, category, priority, action_url, is_read, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (status === "read") query = query.eq("is_read", true);
  if (status === "unread") query = query.eq("is_read", false);
  if (category && category !== "all") query = query.eq("category", category);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error: queryError, count } = await query.range(from, to);

  if (queryError) {
    return NextResponse.json(
      {
        error:
          "Unable to fetch notifications. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    notifications: data ?? [],
    pagination: buildPagination(page, pageSize, count ?? 0)
  });
}

export async function PATCH(request: Request) {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  if (action === "markAllRead") {
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id query parameter." }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(request: Request) {
  const { error, supabase, user } = await requireManagerOrAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as NotificationPayload;

    if (!body.title || !body.message) {
      return NextResponse.json({ error: "title and message are required." }, { status: 400 });
    }

    const payload = {
      user_id: body.userId ?? user.id,
      title: body.title,
      message: body.message,
      category: body.category ?? "general",
      priority: body.priority ?? "normal",
      action_url: body.actionUrl ?? null,
      is_read: false
    };

    const { data, error: insertError } = await supabase
      .from("notifications")
      .insert(payload)
      .select("id, title, message, category, priority, action_url, is_read, created_at")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create notification." }, { status: 500 });
  }
}