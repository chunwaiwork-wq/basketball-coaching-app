import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const studentId = searchParams.get("studentId");

  // User-based login (email/Google): resolve the linked Student server-side.
  // A User id is NEVER a Student id — they are separate tables with separate
  // auto-increment sequences, so we must never trust a client-supplied studentId
  // for user accounts.
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: { student: true },
    });

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

  // PIN-based student login: the student knows their PIN, so studentId is their
  // own authenticated identity.
  if (studentId) {
    const videos = await prisma.video.findMany({
      where: { studentId: parseInt(studentId) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(videos);
  }

  return NextResponse.json(
    { error: "userId or studentId required" },
    { status: 400 }
  );
}
