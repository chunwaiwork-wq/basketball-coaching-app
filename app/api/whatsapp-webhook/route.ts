import { NextResponse } from "next/server";

// ── In-memory conversation state ──────────────────────────────────────
// Resets on server restart — fine for now. Use DB for production.
const conversations = new Map<string, { step: number; answers: Record<string, string> }>();

const QUESTIONS = [
  { key: "name", ask: "What's your name? 🏀" },
  { key: "age", ask: "Nice! How old are you?" },
  { key: "gender", ask: "Got it! What's your gender?" },
  { key: "experience", ask: "How many years of basketball experience do you have?" },
  { key: "goals", ask: "What do you want to improve on most?" },
  { key: "startDate", ask: "Last one — when would you like to start your free trial?" },
] as const;

// ── GET: Webhook verification (called by Meta on setup) ──────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken && challenge) {
    console.log("✅ Webhook verified by Meta!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

// ── POST: Receive incoming WhatsApp messages ─────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Meta may send a status update — ignore those
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      return NextResponse.json({ status: "ok" }); // Acknowledge status updates
    }

    const from = message.from; // sender's phone number
    const text = (message.text?.body || "").trim();
    const msgType = message.type;

    // Ignore non-text messages (images, etc.)
    if (msgType !== "text") {
      await sendWhatsApp(from, "Please reply with text only 😊");
      return NextResponse.json({ status: "ok" });
    }

    // Get or create conversation
    if (!conversations.has(from)) {
      conversations.set(from, { step: 0, answers: {} });
    }

    const conv = conversations.get(from)!;

    // Save their answer (skip for first message — it's just a greeting)
    if (conv.step > 0) {
      const prevKey = QUESTIONS[conv.step - 1].key;
      conv.answers[prevKey] = text;
    }

    // Ask next question or finish
    if (conv.step < QUESTIONS.length) {
      const question = QUESTIONS[conv.step].ask;
      await sendWhatsApp(from, question);
      conv.step++;
    } else {
      // All done! Save to database & notify coach
      const allAnswers = conv.answers;
      await sendWhatsApp(
        from,
        `✅ Thanks ${allAnswers.name || "baller"}! Your free trial request has been received.\n\nCoach will reach out to you shortly on this chat. See you on court! 🏀`
      );

      // Send Telegram notification to coach
      await notifyCoach(allAnswers);

      // Clean up conversation
      conversations.delete(from);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

// ── Send a message via WhatsApp Cloud API ────────────────────────────
async function sendWhatsApp(to: string, text: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }

  await fetch(
    `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    }
  );
}

// ── Notify coach via Telegram ────────────────────────────────────────
async function notifyCoach(answers: Record<string, string>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const text = [
    `🏀 *NEW FREE TRIAL SIGNUP (via WhatsApp)*`,
    ``,
    `*Name:* ${answers.name || "—"}`,
    `*Age:* ${answers.age || "—"}`,
    `*Gender:* ${answers.gender || "—"}`,
    `*Experience:* ${answers.experience || "—"} years`,
    `*Goals:* ${answers.goals || "—"}`,
    `*Wants to start:* ${answers.startDate || "—"}`,
    ``,
    `👉 [413OPENCOURT CRM](https://basketball-coaching-app-one.vercel.app/dashboard/leads)`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: 214421742,
      text,
      parse_mode: "Markdown",
    }),
  });
}
