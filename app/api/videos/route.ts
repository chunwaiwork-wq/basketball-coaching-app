import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const studentId = searchParams.get("studentId");
  const pin = searchParams.get("pin");
  const email = searchParams.get("email");

  // User-based login (email/Google): resolve the linked Student server-side.
  // A User id is NEVER a Student id — they are separate tables with separate
  // auto-increment sequences, so we must never trust a client-supplied studentId
  // for user accounts. The account's email must match too, so userIds can't be
  // enumerated blindly.
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { student: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }

    // Email check: only the account owner (who knows their own email) can fetch.
    if (!email || email.trim().toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // No linked Student record → this user owns no videos.
    if (!user?.student) {
      return NextResponse.json([]);
    }

    const videos = await prisma.video.findMany({
      where: { studentId: user.student.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  }

  // PIN-based student login: the student must prove they know the PIN that
  // belongs to this studentId, otherwise anyone could enumerate student ids.
  if (studentId) {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!pin || pin.trim() !== student.pin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  }

  return NextResponse.json(
    { error: "userId or studentId required" },
    { status: 400 }
  );
}
