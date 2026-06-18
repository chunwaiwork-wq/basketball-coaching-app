import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "Student ID required" }, { status: 400 });
  }

  const videos = await prisma.video.findMany({
    where: { studentId: parseInt(studentId) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(videos);
}