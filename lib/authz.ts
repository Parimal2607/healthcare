import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/types/user.types";

async function getAuthenticatedProfile() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase,
      user: null,
      role: null,
      status: null
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      error: NextResponse.json({ error: "Profile not found" }, { status: 403 }),
      supabase,
      user,
      role: null,
      status: null
    };
  }

  return {
    error: null,
    supabase,
    user,
    role: profile.role as UserRole,
    status: profile.status as UserStatus
  };
}

export async function requireAuthenticated() {
  const result = await getAuthenticatedProfile();

  if (result.error) {
    return {
      error: result.error,
      supabase: result.supabase,
      user: result.user as User | null,
      role: null as UserRole | null
    };
  }

  if (result.status !== "active") {
    return {
      error: NextResponse.json({ error: "User is inactive." }, { status: 403 }),
      supabase: result.supabase,
      user: result.user as User,
      role: result.role
    };
  }

  return {
    error: null,
    supabase: result.supabase,
    user: result.user as User,
    role: result.role
  };
}

export async function requireManagerOrAdmin() {
  const result = await requireAuthenticated();

  if (result.error) {
    return { error: result.error, supabase: result.supabase, user: result.user, role: result.role };
  }

  if (result.role !== "admin" && result.role !== "manager") {
    return {
      error: NextResponse.json({ error: "Forbidden. Manager or admin access required." }, { status: 403 }),
      supabase: result.supabase,
      user: result.user,
      role: result.role
    };
  }

  return { error: null, supabase: result.supabase, user: result.user, role: result.role };
}

export async function requireAdmin() {
  const result = await requireAuthenticated();

  if (result.error) {
    return { error: result.error, supabase: result.supabase, user: result.user };
  }

  if (result.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 }),
      supabase: result.supabase,
      user: result.user
    };
  }

  return { error: null, supabase: result.supabase, user: result.user };
}
