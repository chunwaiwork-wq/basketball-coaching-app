// GET /api/calendar/callback — handle OAuth redirect from Google
import { NextRequest, NextResponse } from "next/server";
import { handleCallback } from "@/lib/googleCalendar";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/dashboard/calendar?error=" + encodeURIComponent(error), req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/calendar?error=No+authorization+code+received", req.url)
    );
  }

  try {
    const { email } = await handleCallback(code);
    return NextResponse.redirect(
      new URL(
        `/dashboard/calendar?success=Connected+as+${encodeURIComponent(email)}`,
        req.url
      )
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.redirect(
      new URL("/dashboard/calendar?error=" + encodeURIComponent(message), req.url)
    );
  }
}
