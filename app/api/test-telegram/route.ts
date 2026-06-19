import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
  }

  const chatId = 214421742;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🧪 Test message from 413OPENCOURT — if you see this, the bot works!",
        }),
      }
    );

    const body = await res.json();
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      telegramResponse: body,
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Unknown error",
    }, { status: 500 });
  }
}
