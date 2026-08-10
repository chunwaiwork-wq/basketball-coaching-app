import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  const coach = await prisma.student.findUnique({ where: { pin: COACH_PIN } });
  return coach;
}

// GET /api/coach/admin?pin=2507 — full admin overview (students, videos, bookings)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const coach = await verifyCoach(searchParams.get("pin"));

    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }

    const [students, videos, bookings] = await Promise.all([
      prisma.student.findMany({
        orderBy: { id: "asc" },
        include: { _count: { select: { videos: true, bookings: true } } },
      }),
      prisma.video.findMany({
        orderBy: { createdAt: "desc" },
        include: { student: { select: { id: true, name: true } } },
      }),
      prisma.coachingSlot.findMany({
        where: { status: { not: "cancelled" } },
        orderBy: { date: "asc" },
        include: { student: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      coach: { id: coach.id, name: coach.name },
      students,
      videos,
      bookings,
    });
  } catch (error) {
    console.error("Coach admin error:", error);
    return NextResponse.json({ error: "Failed to load admin data" }, { status: 500 });
  }
}
