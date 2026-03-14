import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface RegisterPayload {
  fullName?: string;
  email?: string;
  organization?: string;
  password?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterPayload;

    if (!body.fullName || !body.email || !body.organization || !body.password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName,
          organization: body.organization
        }
      }
    });

    if (signupError || !signupData.user) {
      return NextResponse.json({ error: signupError?.message ?? "Unable to create account." }, { status: 400 });
    }

    let hasSession = Boolean(signupData.session);

    if (!hasSession) {
      const { error: signinError } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password
      });

      if (signinError) {
        return NextResponse.json(
          {
            error:
              "Account created but auto-login failed. Disable email confirmation in Supabase Auth settings for instant dashboard redirect."
          },
          { status: 400 }
        );
      }

      hasSession = true;
    }

    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: signupData.user.id,
        full_name: body.fullName,
        email: body.email,
        organization: body.organization,
        role: "member",
        status: "active"
      },
      { onConflict: "id" }
    );

    // Do not block onboarding if profile table is not ready yet.
    if (profileError) {
      return NextResponse.json({
        success: true,
        redirectToDashboard: hasSession,
        profileSynced: false,
        warning: "Profile table sync failed. Please run supabase/schema.sql in Supabase SQL Editor."
      });
    }

    return NextResponse.json({
      success: true,
      redirectToDashboard: hasSession,
      profileSynced: true
    });
  } catch {
    return NextResponse.json({ error: "Unable to register. Please try again." }, { status: 500 });
  }
}
