import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authz";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("claims")
    .select("id, claim_code, patient_id, amount, status, submitted_at")
    .order("submitted_at", { ascending: false });

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ claims: data ?? [] });
}
