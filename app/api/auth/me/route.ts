import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, organization, role, status")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name ?? user.user_metadata.full_name ?? null,
        organization: profile?.organization ?? user.user_metadata.organization ?? null,
        role: profile?.role ?? "member",
        status: profile?.status ?? "active"
      }
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
