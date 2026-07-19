import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const video = await prisma.video.create({
      data: {
        title: "Session on 170726",
        url: "rLtb8tSyQ_Y",
        category: "PAST",
        studentId: 1, // Gordon's ID
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
