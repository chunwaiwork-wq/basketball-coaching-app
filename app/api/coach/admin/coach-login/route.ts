import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

// POST /api/coach/admin/coach-login
// body: { pin: coachPin, email, password }
// Creates (or updates) the coach's email/password login and links it to the
// Coach student record. Coach-PIN protected, so only the coach can do this.
// Deliberately does NOT create a CRM lead or fire the new-lead Telegram ping.
export async function POST(request: Request) {
  try {
    const { pin, email, password } = await request.json();

    if (pin !== COACH_PIN) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const coachStudent = await prisma.student.findUnique({ where: { pin: COACH_PIN } });
    if (!coachStudent) {
      return NextResponse.json({ error: "Coach student record not found" }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const existing = await prisma.user.findUnique({
      where: { email: normalized },
      include: { student: true },
    });

    let user;

    if (existing) {
      // Never take over an account that belongs to a different student.
      if (existing.student && existing.student.id !== coachStudent.id) {
        return NextResponse.json(
          { error: `That email is already linked to student "${existing.student.name}"` },
          { status: 409 }
        );
      }
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { password: hashed, name: coachStudent.name, role: "coach" },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: normalized,
          password: hashed,
          name: coachStudent.name,
          role: "coach",
        },
      });
    }

    await prisma.student.update({
      where: { id: coachStudent.id },
      data: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      student: { id: coachStudent.id, name: coachStudent.name, pin: coachStudent.pin },
    });
  } catch (error) {
    console.error("Coach login setup error:", error);
    return NextResponse.json({ error: "Failed to set up coach login" }, { status: 500 });
  }
}
