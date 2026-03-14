import { NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/authz";

interface UserSettingsPayload {
  themePreference?: "light" | "dark" | "system";
  timezone?: string;
  dateFormat?: string;
  landingPage?: string;
  compactMode?: boolean;
}

function mapDbRow(row: Record<string, unknown> | null) {
  if (!row) {
    return {
      themePreference: "system",
      timezone: "Asia/Calcutta",
      dateFormat: "DD/MM/YYYY",
      landingPage: "/dashboard",
      compactMode: false
    };
  }

  return {
    themePreference: (row.theme_preference as string) ?? "system",
    timezone: (row.timezone as string) ?? "Asia/Calcutta",
    dateFormat: (row.date_format as string) ?? "DD/MM/YYYY",
    landingPage: (row.landing_page as string) ?? "/dashboard",
    compactMode: (row.compact_mode as boolean) ?? false
  };
}

export async function GET() {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("user_settings")
    .select("theme_preference, timezone, date_format, landing_page, compact_mode")
    .eq("user_id", user.id)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json(
      {
        error:
          "Unable to fetch settings. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: mapDbRow(data as Record<string, unknown> | null) });
}

export async function PUT(request: Request) {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  try {
    const body = (await request.json()) as UserSettingsPayload;

    const payload = {
      user_id: user.id,
      theme_preference: body.themePreference ?? "system",
      timezone: body.timezone ?? "Asia/Calcutta",
      date_format: body.dateFormat ?? "DD/MM/YYYY",
      landing_page: body.landingPage ?? "/dashboard",
      compact_mode: body.compactMode ?? false
    };

    const { data, error: upsertError } = await supabase
      .from("user_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select("theme_preference, timezone, date_format, landing_page, compact_mode")
      .single();

    if (upsertError) {
      return NextResponse.json(
        {
          error:
            "Unable to save settings. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ settings: mapDbRow(data as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "Unable to save settings." }, { status: 500 });
  }
}