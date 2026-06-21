import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/student/book — book a coaching slot
export async function POST(req: Request) {
  try {
    const { slotId, studentId } = await req.json();

    if (!slotId || !studentId) {
      return NextResponse.json({ error: "slotId and studentId required" }, { status: 400 });
    }

    // Check slot exists and is available
    const slot = await prisma.coachingSlot.findUnique({ where: { id: slotId } });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.status !== "available") {
      return NextResponse.json({ error: "Slot is already booked" }, { status: 409 });
    }

    // Check student exists
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Book the slot
    const updated = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: {
        status: "booked",
        studentId,
      },
      include: { student: { select: { id: true, name: true } } },
    });

    // Send Telegram notification
    const formattedDate = new Intl.DateTimeFormat("en-SG", {
      timeZone: "Asia/Singapore",
      dateStyle: "full",
      timeStyle: "short",
    }).format(updated.date);

    const message = `🏀 **New Booking!**
**Student:** ${student.name}
**Date:** ${formattedDate}
**Duration:** ${updated.duration} min`;
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: parseInt(chatId),
          text: message,
          parse_mode: "Markdown",
        }),
      }).catch((err) => console.error("Telegram notify error:", err));
    }

    return NextResponse.json({ slot: updated }, { status: 201 });
  } catch (error) {
    console.error("Error booking slot:", error);
    return NextResponse.json({ error: "Failed to book slot" }, { status: 500 });
  }
}
