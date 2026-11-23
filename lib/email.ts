const TO_YOU = 214421742; // This Telegram chat

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
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log("ℹ️  BREVO_API_KEY not set — can't email guide to lead");
    return;
  }

  console.log(`📧 Sending free shooting guide to ${name} <${email}>`);

  // Read the PDF from the filesystem
  const fs = await import("fs");
  const path = await import("path");
  const pdfPath = path.join(process.cwd(), "public", "free-shooting-guide.pdf");
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBuffer.toString("base64");

  const html = [
    `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">`,
    `  <h2 style="color: #e53e3e;">🏀 Here's Your Free Shooting Guide!</h2>`,
    `  <p>Hey ${name},</p>`,
    `  <p>Thanks for signing up! Your free shooting guide is attached to this email.</p>`,
    `  <p>Practice these drills and watch your game improve 💪</p>`,
    `  <br/>`,
    `  <p style="color: #666;">— Coach at <strong>413OPENCOURT</strong></p>`,
    `</div>`,
  ].join("\n");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "413OPENCOURT", email: "413opencourt@gmail.com" },
      to: [{ email, name }],
      subject: "Your Free Shooting Guide 🏀",
      htmlContent: html,
      attachment: [
        {
          name: "free-shooting-guide.pdf",
          content: pdfBase64,
        },
      ],
    }),
  });

  if (res.ok) {
    console.log("✅ Guide emailed to lead via Brevo");
  } else {
    const err = await res.text();
    console.error("❌ Brevo guide email error:", res.status, err);
  }
}

// ── Exported: password reset link ─────────────────────────────────────

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  resetUrl: string
) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("❌ BREVO_API_KEY not set — can't send password reset email");
    return false;
  }

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

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "413OPENCOURT", email: "413opencourt@gmail.com" },
      to: [{ email, name }],
      subject: "Reset your 413OPENCOURT password",
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    console.error("❌ Brevo reset email error:", res.status, await res.text());
    return false;
  }
  return true;
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

