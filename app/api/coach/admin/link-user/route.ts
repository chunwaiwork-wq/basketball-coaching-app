import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

// POST /api/coach/admin/link-user — link a User account (email login) to a Student (PIN)
// body: { pin: coachPin, studentId, email }
export async function POST(request: Request) {
  try {
    const { pin, studentId, email } = await request.json();

    if (pin !== COACH_PIN) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId || !email || typeof email !== "string") {
      return NextResponse.json({ error: "studentId and email are required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { student: true },
    });
    if (!user) {
      return NextResponse.json({ error: `No account found for ${email}` }, { status: 404 });
    }

    if (student.userId && student.userId !== user.id) {
      return NextResponse.json(
        { error: `This student is already linked to another account (user ${student.userId})` },
        { status: 409 }
      );
    }
    if (user.student && user.student.id !== student.id) {
      return NextResponse.json(
        { error: `This account is already linked to student "${user.student.name}"` },
        { status: 409 }
      );
    }

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: { userId: user.id },
    });

    // Align the account display name with the student's name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: student.name },
    });

    return NextResponse.json({
      success: true,
      student: { id: updatedStudent.id, name: updatedStudent.name, userId: updatedStudent.userId },
      user: { id: user.id, name: student.name, email: user.email },
    });
  } catch (error) {
    console.error("Coach link-user error:", error);
    return NextResponse.json({ error: "Failed to link account" }, { status: 500 });
  }
}
