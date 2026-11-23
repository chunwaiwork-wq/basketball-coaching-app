import { NextResponse } from "next/server";

const COACH_PIN = "2507";

// POST /api/coach/admin/test-email — coach-only Brevo diagnostic
// body: { pin: coachPin, to?: "someone@example.com" }
// Reports whether the API key exists/validates and what Brevo returns when we
// actually try to send. Never returns the key itself.
export async function POST(request: Request) {
  try {
    const { pin, to } = await request.json();

    if (pin !== COACH_PIN) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const result: Record<string, unknown> = {
      keyPresent: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPrefix: apiKey ? `${apiKey.slice(0, 6)}…` : null,
      sender: "413opencourt@gmail.com",
    };

    if (!apiKey) {
      result.verdict = "BREVO_API_KEY is not set in this environment — no email can be sent.";
      return NextResponse.json(result);
    }

    // 1) Is the key itself valid?
    try {
      const acc = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": apiKey, accept: "application/json" },
        cache: "no-store",
      });
      const accBody = await acc.text();
      result.accountCheck = { status: acc.status, body: accBody.slice(0, 600) };
    } catch (err: any) {
      result.accountCheck = { status: 0, body: `fetch failed: ${err?.message || err}` };
    }

    // 2) Can we actually send?
    const target = typeof to === "string" && to.includes("@") ? to : "413opencourt@gmail.com";
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "413OPENCOURT", email: "413opencourt@gmail.com" },
          to: [{ email: target }],
          subject: "413OPENCOURT email test",
          htmlContent:
            '<div style="font-family:Arial,sans-serif"><h2>Sending works ✅</h2><p>This is a diagnostic test from your 413OPENCOURT site.</p></div>',
        }),
      });
      const body = await res.text();
      result.sendCheck = {
        to: target,
        status: res.status,
        ok: res.ok,
        body: body.slice(0, 900),
      };
    } catch (err: any) {
      result.sendCheck = { to: target, status: 0, ok: false, body: `fetch failed: ${err?.message || err}` };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("test-email error:", error);
    return NextResponse.json({ error: "Diagnostic failed" }, { status: 500 });
  }
}
