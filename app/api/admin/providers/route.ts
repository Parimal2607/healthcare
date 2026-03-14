import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("providers")
    .select("id, provider_code, name, specialty, organization, patients_managed, status")
    .order("created_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ providers: data ?? [] });
}
