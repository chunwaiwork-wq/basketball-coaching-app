import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

// POST /api/coach/admin/student-login
// body: { pin: coachPin, studentId, email, password }
// Creates or resets a student's email/password login and links it to their
// Student record. Coach-PIN protected. Does NOT create a CRM lead or send the
// new-lead Telegram notification (unlike the public /api/auth/register).
export async function POST(request: Request) {
  try {
    const { pin, studentId, email, password } = await request.json();

    if (pin !== COACH_PIN) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const normalized = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 12);

    const existing = await prisma.user.findUnique({
      where: { email: normalized },
      include: { student: true },
    });

    let user;

    if (existing) {
      // Don't hijack an account that belongs to a different student.
      if (existing.student && existing.student.id !== student.id) {
        return NextResponse.json(
          { error: `That email is already linked to student "${existing.student.name}"` },
          { status: 409 }
        );
      }
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashed, name: student.name, role: "student" },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: normalized,
          password: hashed,
          name: student.name,
          role: "student",
        },
      });
    }

    // Link the login to the student, and keep the CRM lead pointed at them.
    await prisma.student.update({
      where: { id: student.id },
      data: { userId: user.id },
    });

    const found = await prisma.lead.findUnique({ where: { email: normalized } });
    // Tag the CRM lead to this student if it isn't already.
    const lead =
      found && found.studentId === null
        ? await prisma.lead.update({ where: { id: found.id }, data: { studentId: student.id } })
        : found;

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      student: { id: student.id, name: student.name, pin: student.pin, userId: user.id },
      lead: lead ? { id: lead.id, name: lead.name, studentId: lead.studentId } : null,
    });
  } catch (error) {
    console.error("Student login setup error:", error);
    return NextResponse.json({ error: "Failed to set up student login" }, { status: 500 });
  }
}
