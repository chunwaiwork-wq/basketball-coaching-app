import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COACH_PIN = "2507";

async function verifyCoach(pin: string | null) {
  if (!pin || pin !== COACH_PIN) return null;
  return prisma.student.findUnique({ where: { pin: COACH_PIN } });
}

// POST /api/coach/admin/videos — add a video to a student
export async function POST(request: Request) {
  try {
    const { pin, studentId, title, url, category } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!studentId || !title || !url) {
      return NextResponse.json({ error: "studentId, title, and url are required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const video = await prisma.video.create({
      data: {
        title,
        url,
        category: category || "PAST",
        studentId: student.id,
      },
    });

    return NextResponse.json({ success: true, studentName: student.name, video }, { status: 201 });
  } catch (error) {
    console.error("Coach add video error:", error);
    return NextResponse.json({ error: "Failed to add video" }, { status: 500 });
  }
}

// DELETE /api/coach/admin/videos — remove a video
export async function DELETE(request: Request) {
  try {
    const { pin, videoId } = await request.json();

    const coach = await verifyCoach(pin);
    if (!coach) {
      return NextResponse.json({ error: "Unauthorized — coach PIN required" }, { status: 401 });
    }
    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    const deleted = await prisma.video.deleteMany({ where: { id: parseInt(videoId) } });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Coach delete video error:", error);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
