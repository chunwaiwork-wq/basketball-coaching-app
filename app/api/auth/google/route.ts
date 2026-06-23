import { NextResponse } from "next/server";
import { google } from "google-auth-library";

const SCOPES_LOGIN = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://basketball-coaching-app-one.vercel.app";

  const oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/google/callback`,
  });

  const url = oauth2Client.generateAuthUrl({
    access_type: "online",
    scope: SCOPES_LOGIN,
    include_granted_scopes: true,
  });

  return NextResponse.redirect(url);
}
