const TO_YOU = 214421742; // This Telegram chat

// ── Provider layer ────────────────────────────────────────────────────
// Uses Resend when RESEND_API_KEY is set, otherwise falls back to Brevo.
// Sender is configurable with EMAIL_FROM (must be a verified domain/address
// on the provider you're using).

const DEFAULT_FROM = "413OPENCOURT <noreply@413opencourt.com>";

type SendResult = {
  ok: boolean;
  provider: "resend" | "brevo" | "none";
  status: number;
  body: string;
};

type Attachment = { filename: string; content: string }; // content = base64

export async function sendEmail(opts: {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}): Promise<SendResult> {
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  const resendKey = process.env.RESEND_API_KEY;

  // ── Resend ──
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [opts.to],
          subject: opts.subject,
          html: opts.html,
          ...(opts.attachments?.length
            ? { attachments: opts.attachments.map((a) => ({ filename: a.filename, content: a.content })) }
            : {}),
        }),
      });
      const body = await res.text();
      if (res.ok) {
        console.log(`✅ Email sent via Resend to ${opts.to}`);
      } else {
        console.error("❌ Resend error:", res.status, body);
      }
      return { ok: res.ok, provider: "resend", status: res.status, body };
    } catch (err: any) {
      console.error("❌ Resend fetch failed:", err);
      return { ok: false, provider: "resend", status: 0, body: String(err?.message || err) };
    }
  }

  // ── Brevo (fallback) ──
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": brevoKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "413OPENCOURT", email: "413opencourt@gmail.com" },
          to: [{ email: opts.to, ...(opts.toName ? { name: opts.toName } : {}) }],
          subject: opts.subject,
          htmlContent: opts.html,
          ...(opts.attachments?.length
            ? { attachment: opts.attachments.map((a) => ({ name: a.filename, content: a.content })) }
            : {}),
        }),
      });
      const body = await res.text();
      if (res.ok) {
        console.log(`✅ Email sent via Brevo to ${opts.to}`);
      } else {
        console.error("❌ Brevo error:", res.status, body);
      }
      return { ok: res.ok, provider: "brevo", status: res.status, body };
    } catch (err: any) {
      console.error("❌ Brevo fetch failed:", err);
      return { ok: false, provider: "brevo", status: 0, body: String(err?.message || err) };
    }
  }

  console.error("❌ No email provider configured (need RESEND_API_KEY or BREVO_API_KEY)");
  return { ok: false, provider: "none", status: 0, body: "No email provider configured" };
}

// ── Exported: notify the business owner ───────────────────────────────

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

  await sendTelegram(name, email, now).catch((err) =>
    console.error("Telegram error:", err)
  );
}

// ── Exported: email the PDF guide directly to the lead ───────────────

export async function sendGuideToLead(name: string, email: string) {
  console.log(`📧 Sending free shooting guide to ${name} <${email}>`);

  // Read the PDF from the filesystem
  const fs = await import("fs");
  const path = await import("path");
  const pdfPath = path.join(process.cwd(), "public", "free-shooting-guide.pdf");

  let attachments: Attachment[] | undefined;
  try {
    const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");
    attachments = [{ filename: "free-shooting-guide.pdf", content: pdfBase64 }];
  } catch (err) {
    console.error("Could not read free-shooting-guide.pdf — sending without attachment:", err);
  }

  const html = [
    `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">`,
    `  <h2 style="color: #C65A24;">🏀 Here's Your Free Shooting Guide!</h2>`,
    `  <p>Hey ${name},</p>`,
    `  <p>Thanks for signing up! Your free shooting guide is attached to this email.</p>`,
    `  <p>Practice these drills and watch your game improve 💪</p>`,
    `  <br/>`,
    `  <p style="color: #666;">— Coach at <strong>413OPENCOURT</strong></p>`,
    `</div>`,
  ].join("\n");

  await sendEmail({
    to: email,
    toName: name,
    subject: "Your Free Shooting Guide 🏀",
    html,
    attachments,
  });
}

// ── Exported: password reset link ─────────────────────────────────────

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  resetUrl: string
): Promise<boolean> {
  const html = [
    `<div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; background:#171717; padding:32px; border-radius:16px;">`,
    `  <h2 style="color:#E9DFC9; margin:0 0 16px;">Reset your password 🏀</h2>`,
    `  <p style="color:#E9DFC9; opacity:.8; line-height:1.6;">Hi ${name},</p>`,
    `  <p style="color:#E9DFC9; opacity:.8; line-height:1.6;">We got a request to reset the password for your 413OPENCOURT account. Tap the button below to choose a new one.</p>`,
    `  <p style="margin:28px 0;">`,
    `    <a href="${resetUrl}" style="background:#C65A24; color:#E9DFC9; padding:14px 28px; border-radius:999px; text-decoration:none; font-weight:bold; display:inline-block;">Set a new password</a>`,
    `  </p>`,
    `  <p style="color:#E9DFC9; opacity:.55; font-size:13px; line-height:1.6;">This link expires in 30 minutes and can only be used once. If you didn't ask for this, you can safely ignore this email — your password won't change.</p>`,
    `  <p style="color:#E9DFC9; opacity:.35; font-size:11px; word-break:break-all;">If the button doesn't work, paste this into your browser:<br/>${resetUrl}</p>`,
    `  <p style="color:#E9DFC9; opacity:.55; font-size:13px; margin-top:28px;">— 413OPENCOURT</p>`,
    `</div>`,
  ].join("\n");

  const result = await sendEmail({
    to: email,
    toName: name,
    subject: "Reset your 413OPENCOURT password",
    html,
  });

  return result.ok;
}

// ── Telegram (notify owner) ──────────────────────────────────────────

async function sendTelegram(name: string, email: string, timestamp: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

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
    console.error("Telegram error:", res.status, body);
  }
}
