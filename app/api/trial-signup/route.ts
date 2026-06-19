import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, age, gender, experience, goals, startDate } = body;

    if (!name || !age || !gender || !experience || !goals || !startDate) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Send to Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      const text = [
        `🏀 *NEW FREE TRIAL SIGNUP!*`,
        ``,
        `*Name:* ${name}`,
        `*Age:* ${age}`,
        `*Gender:* ${gender}`,
        `*Experience:* ${experience} years`,
        `*Goals:* ${goals}`,
        `*Wants to start:* ${startDate}`,
        ``,
        `👉 [413OPENCOURT CRM](https://basketball-coaching-app-one.vercel.app/dashboard/leads)`,
      ].join("\n");

      await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: 214421742,
            text,
            parse_mode: "Markdown",
          }),
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Trial signup error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
