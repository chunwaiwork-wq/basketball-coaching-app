import { NextResponse } from "next/server";
import { sendEmail } from "../../../../../lib/email";

const COACH_PIN = "2507";

// POST /api/coach/admin/test-email — coach-only email diagnostic
// body: { pin: coachPin, to?: "someone@example.com" }
// Sends a real test message through whichever provider is configured and
// reports the provider, status and raw response body. Never returns secrets.
export async function POST(request: Request) {
  try {
    const { pin, to } = await request.json();

    if (pin !== COACH_PIN) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }

    const target = typeof to === "string" && to.includes("@") ? to : "413opencourt@gmail.com";

    const env = {
      resendKeyPresent: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY
        ? `${process.env.RESEND_API_KEY.slice(0, 5)}…`
        : null,
      brevoKeyPresent: !!process.env.BREVO_API_KEY,
      from: process.env.EMAIL_FROM || "413OPENCOURT <noreply@413opencourt.com> (default)",
    };

    const result = await sendEmail({
      to: target,
      subject: "413OPENCOURT email test",
      html: `<div style="font-family:Arial,sans-serif"><h2>Sending works ✅</h2><p>Diagnostic test from your 413OPENCOURT site.</p><p>Provider: <strong>${process.env.RESEND_API_KEY ? "Resend" : "Brevo"}</strong></p></div>`,
    });

    return NextResponse.json({
      env,
      sending: {
        to: target,
        provider: result.provider,
        status: result.status,
        ok: result.ok,
        response: result.body.slice(0, 900),
      },
    });
  } catch (error) {
    console.error("test-email error:", error);
    return NextResponse.json({ error: "Diagnostic failed" }, { status: 500 });
  }
}
