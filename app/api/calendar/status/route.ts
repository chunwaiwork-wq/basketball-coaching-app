// GET /api/calendar/status — check if Google Calendar is connected
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const record = await prisma.coachCalendar.findFirst();
    return NextResponse.json({
      connected: !!record,
      email: record?.email || null,
    });
  } catch {
    return NextResponse.json({ connected: false, email: null });
  }
}
