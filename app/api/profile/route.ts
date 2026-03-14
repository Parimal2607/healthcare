import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, full_name, email, organization, role, status, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Unable to fetch profile." }, { status: 500 });
  }
}

interface UpdateProfilePayload {
  fullName?: string;
  organization?: string;
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as UpdateProfilePayload;

    if (!body.fullName || !body.organization) {
      return NextResponse.json({ error: "fullName and organization are required." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name: body.fullName,
        organization: body.organization
      })
      .eq("id", user.id)
      .select("id, full_name, email, organization, role, status, created_at, updated_at")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: updated });
  } catch {
    return NextResponse.json({ error: "Unable to update profile." }, { status: 500 });
  }
}
