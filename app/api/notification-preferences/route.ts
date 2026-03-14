import { NextResponse } from "next/server";
import { requireAuthenticated } from "@/lib/authz";

interface NotificationPreferencesPayload {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  smsEnabled?: boolean;
  securityAlerts?: boolean;
  consentUpdates?: boolean;
  claimsUpdates?: boolean;
  integrationAlerts?: boolean;
  weeklyDigest?: boolean;
}

function mapDbRow(row: Record<string, unknown> | null) {
  if (!row) {
    return {
      emailEnabled: true,
      inAppEnabled: true,
      smsEnabled: false,
      securityAlerts: true,
      consentUpdates: true,
      claimsUpdates: true,
      integrationAlerts: true,
      weeklyDigest: false
    };
  }

  return {
    emailEnabled: (row.email_enabled as boolean) ?? true,
    inAppEnabled: (row.in_app_enabled as boolean) ?? true,
    smsEnabled: (row.sms_enabled as boolean) ?? false,
    securityAlerts: (row.security_alerts as boolean) ?? true,
    consentUpdates: (row.consent_updates as boolean) ?? true,
    claimsUpdates: (row.claims_updates as boolean) ?? true,
    integrationAlerts: (row.integration_alerts as boolean) ?? true,
    weeklyDigest: (row.weekly_digest as boolean) ?? false
  };
}

export async function GET() {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  const { data, error: queryError } = await supabase
    .from("notification_preferences")
    .select(
      "email_enabled, in_app_enabled, sms_enabled, security_alerts, consent_updates, claims_updates, integration_alerts, weekly_digest"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (queryError) {
    return NextResponse.json(
      {
        error:
          "Unable to fetch notification preferences. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ preferences: mapDbRow(data as Record<string, unknown> | null) });
}

export async function PUT(request: Request) {
  const { error, supabase, user } = await requireAuthenticated();
  if (error) return error;

  try {
    const body = (await request.json()) as NotificationPreferencesPayload;

    const payload = {
      user_id: user.id,
      email_enabled: body.emailEnabled ?? true,
      in_app_enabled: body.inAppEnabled ?? true,
      sms_enabled: body.smsEnabled ?? false,
      security_alerts: body.securityAlerts ?? true,
      consent_updates: body.consentUpdates ?? true,
      claims_updates: body.claimsUpdates ?? true,
      integration_alerts: body.integrationAlerts ?? true,
      weekly_digest: body.weeklyDigest ?? false
    };

    const { data, error: upsertError } = await supabase
      .from("notification_preferences")
      .upsert(payload, { onConflict: "user_id" })
      .select(
        "email_enabled, in_app_enabled, sms_enabled, security_alerts, consent_updates, claims_updates, integration_alerts, weekly_digest"
      )
      .single();

    if (upsertError) {
      return NextResponse.json(
        {
          error:
            "Unable to save notification preferences. Run supabase/steps/08_settings_notifications_platform_integrations.sql and retry."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences: mapDbRow(data as Record<string, unknown>) });
  } catch {
    return NextResponse.json({ error: "Unable to save notification preferences." }, { status: 500 });
  }
}