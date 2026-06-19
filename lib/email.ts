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

