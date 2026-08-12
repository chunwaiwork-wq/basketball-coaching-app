import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// Generate a unique 4-digit PIN not already in use
async function generateUniquePin(): Promise<string> {
  const existing = await prisma.student.findMany({ select: { pin: true } });
  const used = new Set(existing.map((s) => s.pin));
  for (let i = 0; i < 200; i++) {
    const candidate = String(Math.floor(1000 + Math.random() * 9000));
    if (!used.has(candidate)) return candidate;
  }
  throw new Error("Could not generate a unique PIN");
}

// POST /api/coach/admin/students — add a new student
// body: { pin: coachPin, name, studentPin?: "1234", packageSize?: 4 | 8 | null }
export async function POST(request: Request) {
  try {
    const { pin, name, studentPin, packageSize } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }
    if (packageSize !== null && packageSize !== undefined && ![4, 8].includes(packageSize)) {
      return NextResponse.json({ error: "packageSize must be 4 or 8 (or null)" }, { status: 400 });
    }
    if (studentPin && !/^\d{4}$/.test(studentPin)) {
      return NextResponse.json({ error: "studentPin must be exactly 4 digits" }, { status: 400 });
    }
    if (studentPin) {
      const dup = await prisma.student.findUnique({ where: { pin: studentPin } });
      if (dup) {
        return NextResponse.json({ error: `PIN ${studentPin} is already used by ${dup.name}` }, { status: 409 });
      }
    }

    const finalPin = studentPin || (await generateUniquePin());

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        pin: finalPin,
        packageSize: packageSize ?? null,
      },
    });

    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error) {
    console.error("Coach add student error:", error);
    return NextResponse.json({ error: "Failed to add student" }, { status: 500 });
  }
}
