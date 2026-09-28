import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// POST /api/coach/admin/sessions/reset — reset (or undo a reset of) a student's session count
// body: { pin, studentId, undo?: boolean }
//
// RESET (default): when a student renews their package the coach resets their
// count so it starts fresh. Previously completed sessions are ARCHIVED (kept in
// history, no longer counted) rather than deleted.
//
// UNDO (undo: true): restores archived sessions back to completed — used to fix
// an accidental reset.
export async function POST(request: Request) {
  try {
    const { pin, studentId, undo } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (undo) {
      // Restore previously archived sessions so they count again.
      const result = await prisma.sessionRecord.updateMany({
        where: { studentId: student.id, status: "archived" },
        data: { status: "completed" },
      });

      return NextResponse.json({
        success: true,
        student: student.name,
        restored: result.count,
        message: `${student.name} — ${result.count} archived session${result.count === 1 ? "" : "s"} restored.`,
      });
    }

    // Archive completed sessions only — an in-progress (active) session is left
    // alone; when it's clocked out it will count toward the new package.
    const result = await prisma.sessionRecord.updateMany({
      where: { studentId: student.id, status: "completed" },
      data: { status: "archived" },
    });

    return NextResponse.json({
      success: true,
      student: student.name,
      archived: result.count,
      message: `${student.name} reset — ${result.count} session${result.count === 1 ? "" : "s"} archived. Package starts fresh.`,
    });
  } catch (error) {
    console.error("Coach reset sessions error:", error);
    return NextResponse.json({ error: "Failed to reset sessions" }, { status: 500 });
  }
}
