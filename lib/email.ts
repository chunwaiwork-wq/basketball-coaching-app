import nodemailer from "nodemailer";

const transporter =
  process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      })
    : null;

export async function sendLeadNotification(name: string, email: string) {
  if (!transporter) {
    console.warn(
      "SMTP not configured — set SMTP_EMAIL and SMTP_PASSWORD env vars to receive lead notifications by email."
    );
    return;
  }

  const now = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  await transporter.sendMail({
    from: `"413OPENCOURT Leads" <${process.env.SMTP_EMAIL}>`,
    to: "413opencourt@gmail.com",
    subject: `🏀 New Lead! ${name} signed up`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
            .header h1 { color: white; font-size: 24px; margin: 0; }
            .header .icon { font-size: 48px; margin-bottom: 12px; }
            .body { padding: 32px; }
            .field { margin-bottom: 20px; }
            .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
            .field-value { font-size: 16px; color: #111; font-weight: 500; }
            .divider { height: 1px; background: #eee; margin: 24px 0; }
            .cta { background: #f0f7ff; border-radius: 12px; padding: 20px; text-align: center; }
            .cta a { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 20px 32px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🏀</div>
              <h1>New Lead Captured!</h1>
            </div>
            <div class="body">
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${name}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${email}</div>
              </div>
              <div class="field">
                <div class="field-label">Signed Up</div>
                <div class="field-value">${now}</div>
              </div>
              <div class="field">
                <div class="field-label">Lead Magnet</div>
                <div class="field-value">Free Shooting Guide (PDF)</div>
              </div>
              <div class="divider"></div>
              <div class="cta">
                <p style="margin: 0 0 12px; color: #444; font-size: 14px;">View all leads in your CRM</p>
                <a href="https://basketball-coaching-app-one.vercel.app/auth">Open CRM Dashboard →</a>
              </div>
            </div>
            <div class="footer">
              413OPENCOURT — Elite Basketball Training
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
