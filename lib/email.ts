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

  // Fire both notifications in parallel — don't block the response
  await Promise.allSettled([
    sendTelegram(name, email, now),
    sendEmail(name, email, now),
  ]);
}

// ── Telegram ──────────────────────────────────────────────────────────

async function sendTelegram(name: string, email: string, timestamp: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN not set — skipping Telegram");
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

  try {
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
      console.error("Telegram send failed:", res.status, body);
    }
  } catch (err) {
    console.error("Telegram send error:", err);
  }
}

// ── Email via Gmail SMTP ─────────────────────────────────────────────

async function sendEmail(name: string, email: string, timestamp: string) {
  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    console.warn("SMTP_EMAIL or SMTP_PASSWORD not set — skipping email");
    return;
  }

  try {
    // Dynamic require — avoids build-time bundling issues on Vercel
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `"413OPENCOURT" <${smtpEmail}>`,
      to: "413opencourt@gmail.com",
      subject: `🏀 New Lead: ${name}`,
      text: [
        `New lead captured from the free shooting guide!`,
        ``,
        `Name:  ${name}`,
        `Email: ${email}`,
        `Time:  ${timestamp}`,
        ``,
        `CRM: https://basketball-coaching-app-one.vercel.app/dashboard/leads`,
      ].join("\n"),
      html: [
        `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">`,
        `  <h2 style="color: #e53e3e;">🏀 New Lead!</h2>`,
        `  <table style="width: 100%; border-collapse: collapse;">`,
        `    <tr><td style="padding: 8px; color: #666;">Name</td><td style="padding: 8px;"><strong>${name}</strong></td></tr>`,
        `    <tr><td style="padding: 8px; color: #666;">Email</td><td style="padding: 8px;"><strong>${email}</strong></td></tr>`,
        `    <tr><td style="padding: 8px; color: #666;">Guide</td><td style="padding: 8px;">Free Shooting Guide (PDF)</td></tr>`,
        `    <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px;">${timestamp}</td></tr>`,
        `  </table>`,
        `  <br/>`,
        `  <a href="https://basketball-coaching-app-one.vercel.app/dashboard/leads" style="display: inline-block; padding: 12px 24px; background: #e53e3e; color: white; text-decoration: none; border-radius: 6px;">Open CRM →</a>`,
        `</div>`,
      ].join("\n"),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email send failed:", err);
  }
}
