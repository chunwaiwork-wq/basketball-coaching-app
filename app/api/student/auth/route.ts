// POST /api/student/auth — authenticate student by PIN
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { pin },
      select: { id: true, name: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Student auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
