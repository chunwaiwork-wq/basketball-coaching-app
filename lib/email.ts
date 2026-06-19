const TO_YOU = 214421742; // This Telegram chat

export async function sendLeadNotification(name: string, email: string) {
  const now = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  console.log(`🔔 sendLeadNotification called for ${name} <${email}>`);

  // Fire both notifications in parallel
  const results = await Promise.allSettled([
    sendTelegram(name, email, now),
    sendEmail(name, email, now),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Notification ${i} failed:`, r.reason);
    }
  });
}

// ── Telegram ──────────────────────────────────────────────────────────

async function sendTelegram(name: string, email: string, timestamp: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log("ℹ️  TELEGRAM_BOT_TOKEN not set");
    return;
  }

  const text = [
    `🏀 *New Lead!*`,
    ``,
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    `*Guide:* Free Shooting Guide (PDF)`,
    `*Time:* ${timestamp}`,
    ``,
    `👉 [Open CRM](https://basketball-coaching-app-one.vercel.app/auth)`,
  ].join("\n");

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TO_YOU,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram error ${res.status}: ${body}`);
  }

  console.log("✅ Telegram sent");
}

// ── Email via Resend API (zero npm dependencies) ──────────────────────
// Free tier: 100 emails/day at https://resend.com

async function sendEmail(name: string, email: string, timestamp: string) {
  const apiKey = process.env.RESEND_API_KEY;

  console.log(
    `📧 sendEmail: RESEND_API_KEY ${
      apiKey ? `set (${apiKey.slice(0, 8)}...)` : "NOT SET"
    }`
  );

  if (!apiKey) {
    console.log(
      "ℹ️  Email skipped — RESEND_API_KEY not set. " +
        "Add it on Vercel: https://vercel.com/chunwaiwork-wq/basketball-coaching-app-one/settings/environment-variables"
    );
    return;
  }

  const html = [
    `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">`,
    `  <h2 style="color: #e53e3e;">🏀 New Lead!</h2>`,
    `  <table style="width:100%;border-collapse:collapse;">`,
    `    <tr><td style="padding:8px;color:#666;">Name</td><td style="padding:8px;"><strong>${name}</strong></td></tr>`,
    `    <tr><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;"><strong>${email}</strong></td></tr>`,
    `    <tr><td style="padding:8px;color:#666;">Guide</td><td style="padding:8px;">Free Shooting Guide (PDF)</td></tr>`,
    `    <tr><td style="padding:8px;color:#666;">Time</td><td style="padding:8px;">${timestamp}</td></tr>`,
    `  </table>`,
    `  <br/>`,
    `  <a href="https://basketball-coaching-app-one.vercel.app/dashboard/leads"`,
    `     style="display:inline-block;padding:12px 24px;background:#e53e3e;color:white;text-decoration:none;border-radius:6px;">Open CRM →</a>`,
    `</div>`,
  ].join("\n");

  console.log("📧 Calling Resend API...");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "413OPENCOURT <onboarding@resend.dev>",
      to: ["413opencourt@gmail.com"],
      subject: `🏀 New Lead: ${name}`,
      html,
    }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log("✅ Email sent via Resend:", data.id);
  } else {
    const err = await res.text();
    throw new Error(`Resend API error ${res.status}: ${err}`);
  }
}
