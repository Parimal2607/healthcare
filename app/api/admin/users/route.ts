import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

interface UpdateUserPayload {
  role?: "admin" | "manager" | "member";
  status?: "active" | "inactive";
}

export async function GET(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  const status = url.searchParams.get("status");

  const source = scope === "team" ? "admin_team_members_v" : "user_profiles";

  let query = supabase
    .from(source)
    .select("id, full_name, email, organization, role, status, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function PATCH(request: Request) {
  const { error, supabase, user } = await requireAdmin();
  if (error) return error;

  try {
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get("id");

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing user id query parameter." }, { status: 400 });
    }

    const body = (await request.json()) as UpdateUserPayload;

    if (!body.role && !body.status) {
      return NextResponse.json({ error: "At least one field is required: role or status." }, { status: 400 });
    }

    if (targetUserId === user?.id && body.role && body.role !== "admin") {
      return NextResponse.json({ error: "Admin cannot demote own role." }, { status: 400 });
    }

    const updatePayload: Record<string, string> = {};

    if (body.role) {
      updatePayload.role = body.role;
    }

    if (body.status) {
      updatePayload.status = body.status;
    }

    const { data, error: updateError } = await supabase
      .from("user_profiles")
      .update(updatePayload)
      .eq("id", targetUserId)
      .select("id, full_name, email, organization, role, status, created_at, updated_at")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json({ error: "Unable to update user." }, { status: 500 });
  }
}
