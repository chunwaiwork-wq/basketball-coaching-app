import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// POST /api/coach/admin/students/package — set a student's purchased package size (4 or 8 sessions)
// body: { pin, studentId, packageSize: 4 | 8 | null }
export async function POST(request: Request) {
  try {
    const { pin, studentId, packageSize } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }
    if (packageSize !== null && packageSize !== undefined && ![4, 8].includes(packageSize)) {
      return NextResponse.json({ error: "packageSize must be 4 or 8 (or null to clear)" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updated = await prisma.student.update({
      where: { id: student.id },
      data: { packageSize: packageSize ?? null },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error) {
    console.error("Coach package error:", error);
    return NextResponse.json({ error: "Failed to update package size" }, { status: 500 });
  }
}
