// GET /api/calendar/auth — redirect to Google OAuth consent screen
import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

export async function GET() {
  const url = getAuthUrl();
  if (!url) {
    return NextResponse.json(
      { error: "Google Calendar is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables." },
      { status: 500 }
    );
  }
  return NextResponse.redirect(url);
}
