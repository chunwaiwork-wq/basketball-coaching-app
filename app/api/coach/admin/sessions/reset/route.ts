import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// POST /api/coach/admin/sessions/reset — reset a student's session count (for renewals)
// body: { pin, studentId }
//
// When a student renews their package (e.g. buys another 4 sessions) the coach
// resets their count so the package starts fresh. We ARCHIVE the previously
// completed sessions instead of deleting them, so attendance history is kept
// but no longer counts toward the current package.
export async function POST(request: Request) {
  try {
    const { pin, studentId } = await request.json();

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
