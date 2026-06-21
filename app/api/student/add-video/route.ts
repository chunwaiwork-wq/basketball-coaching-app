import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { pin, title, url, category } = await request.json();

    if (!pin || !title || !url || !category) {
      return NextResponse.json(
        { error: "pin, title, url, and category are required" },
        { status: 400 }
      );
    }

    // Find student by PIN
    const student = await prisma.student.findUnique({
      where: { pin },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found with that PIN" },
        { status: 404 }
      );
    }

    // Create the video
    const video = await prisma.video.create({
      data: {
        title,
        url,
        category,
        studentId: student.id,
      },
    });

    return NextResponse.json({
      success: true,
      student: student.name,
      video: {
        id: video.id,
        title: video.title,
        url: video.url,
        category: video.category,
      },
    });
  } catch (err: any) {
    console.error("Add video error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
