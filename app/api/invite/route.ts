import { NextResponse } from "next/server";

import {
  createSupabaseAdminClient,
  createSupabaseAuthClient,
  isInviteAdminEmail,
} from "@/utils/supabase/admin";

type InviteRequestBody = {
  email?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getRedirectTo(request: Request) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  return new URL("/", request.url).toString();
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 401 });
  }

  const authClient = createSupabaseAuthClient();
  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser(accessToken);

  if (userError || !user) {
    return NextResponse.json({ error: "Unable to verify session." }, { status: 401 });
  }

  if (!isInviteAdminEmail(user.email)) {
    return NextResponse.json({ error: "You do not have invite access." }, { status: 403 });
  }

  const body = (await request.json()) as InviteRequestBody;
  const email = normalizeEmail(body.email ?? "");

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();

  const { error: upsertError } = await adminClient.from("invited_emails").upsert(
    {
      email,
      invited_by: user.id,
    },
    { onConflict: "email" },
  );

  if (upsertError) {
    return NextResponse.json(
      { error: "Failed to store the invite allowlist entry." },
      { status: 500 },
    );
  }

  const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo: getRedirectTo(request),
  });

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  return NextResponse.json({
    message: `Invite sent to ${email}.`,
  });
}
