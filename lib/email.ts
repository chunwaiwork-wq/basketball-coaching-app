const TO_YOU = 214421742; // This chat

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

  // --- Telegram ---
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("TELEGRAM_BOT_TOKEN not set — skipping notification");
    return;
  }

  const text = [
    `🏀 *New Lead!*`,
    ``,
    `*Name:* ${name}`,
    `*Email:* ${email}`,
    `*Guide:* Free Shooting Guide (PDF)`,
    `*Time:* ${now}`,
    ``,
    `👉 [Open CRM](https://basketball-coaching-app-one.vercel.app/auth)`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TO_YOU,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    // Also try to send via email using Gmail SMTP via fetch if credentials available
    if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      await sendEmail(name, email, now);
    }
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

async function sendEmail(name: string, email: string, timestamp: string) {
  // Gmail SMTP via HTTPS — using Gmail's API requires OAuth, so we skip for now
  // Email notification coming once user sets up a proper email service
  console.log("Email notification not yet implemented via simple SMTP");
}
