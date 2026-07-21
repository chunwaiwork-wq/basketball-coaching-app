import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const video = await prisma.video.create({
      data: {
        title: "Session on 190726",
        url: "f6cbCmygK6U",
        category: "PAST",
        studentId: 3, // Justice's ID
      },
    });
    return NextResponse.json({ success: true, video });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
