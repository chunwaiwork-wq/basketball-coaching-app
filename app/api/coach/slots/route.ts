import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/coach/slots — list all coaching slots (with optional date filter)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // optional YYYY-MM-DD

    const where: Record<string, unknown> = {};
    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);
      const end = new Date(`${date}T23:59:59.999Z`);
      where.date = { gte: start, lte: end };
    }

    const slots = await prisma.coachingSlot.findMany({
      where,
      include: { student: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

// POST /api/coach/slots — create new slot(s)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slots } = body; // Array of { date: ISO string, duration?: number }

    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "Provide at least one slot" }, { status: 400 });
    }

    const created = await Promise.all(
      slots.map((s: { date: string; duration?: number }) =>
        prisma.coachingSlot.create({
          data: {
            date: new Date(s.date),
            duration: s.duration ?? 60,
            status: "available",
          },
        })
      )
    );

    return NextResponse.json({ slots: created }, { status: 201 });
  } catch (error) {
    console.error("Error creating slots:", error);
    return NextResponse.json({ error: "Failed to create slots" }, { status: 500 });
  }
}

// PATCH /api/coach/slots — update slot status (confirm/cancel)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { slotId, status } = body;

    if (!slotId || !status) {
      return NextResponse.json({ error: "slotId and status required" }, { status: 400 });
    }

    const validStatuses = ["available", "booked", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    const slot = await prisma.coachingSlot.update({
      where: { id: slotId },
      data: { status },
      include: { student: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

// DELETE /api/coach/slots — delete a slot
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slotId = parseInt(searchParams.get("slotId") || "");

    if (!slotId) {
      return NextResponse.json({ error: "slotId required" }, { status: 400 });
    }

    await prisma.coachingSlot.delete({ where: { id: slotId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}
