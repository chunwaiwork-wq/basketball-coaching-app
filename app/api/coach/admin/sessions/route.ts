import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// GET /api/coach/admin/sessions?pin=2507 — all session records with student names
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coach = await verifyCoach(searchParams.get("pin"));
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }

    const sessions = await prisma.sessionRecord.findMany({
      orderBy: { clockIn: "desc" },
      include: { student: { select: { id: true, name: true, packageSize: true } } },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Coach sessions error:", error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}

// POST /api/coach/admin/sessions — clock in / clock out
// body: { pin, studentId, action: "in" | "out" }
export async function POST(request: Request) {
  try {
    const { pin, studentId, action } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId || !action) {
      return NextResponse.json({ error: "studentId and action are required" }, { status: 400 });
    }
    if (!["in", "out"].includes(action)) {
      return NextResponse.json({ error: "action must be 'in' or 'out'" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const sid = student.id;

    if (action === "in") {
      // Prevent double clock-in: cancel any stale active sessions first? No —
      // only block if there's already an active one for this student.
      const existing = await prisma.sessionRecord.findFirst({
        where: { studentId: sid, status: "active" },
      });
      if (existing) {
        return NextResponse.json(
          { error: `${student.name} is already clocked in (since ${existing.clockIn.toISOString()})` },
          { status: 409 }
        );
      }
      const session = await prisma.sessionRecord.create({
        data: { studentId: sid, status: "active" },
      });
      return NextResponse.json({ success: true, message: `${student.name} clocked in`, session }, { status: 201 });
    }

    // action === "out"
    const active = await prisma.sessionRecord.findFirst({
      where: { studentId: sid, status: "active" },
    });
    if (!active) {
      return NextResponse.json(
        { error: `${student.name} has no active session to clock out of` },
        { status: 409 }
      );
    }

    const now = new Date();
    const durationMin = Math.max(1, Math.round((now.getTime() - active.clockIn.getTime()) / 60000));

    const session = await prisma.sessionRecord.update({
      where: { id: active.id },
      data: { clockOut: now, status: "completed" },
    });

    return NextResponse.json({
      success: true,
      message: `${student.name} clocked out — session ${durationMin} min`,
      session,
      durationMin,
    });
  } catch (error) {
    console.error("Coach clock error:", error);
    return NextResponse.json({ error: "Failed to process clock action" }, { status: 500 });
  }
}

// DELETE /api/coach/admin/sessions — remove a session record (fix mistakes)
// body: { pin, sessionId }
export async function DELETE(request: Request) {
  try {
    const { pin, sessionId } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const deleted = await prisma.sessionRecord.deleteMany({ where: { id: parseInt(sessionId) } });
    if (deleted.count === 0) {
      return NextResponse.json({ error: "Session record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coach delete session error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
