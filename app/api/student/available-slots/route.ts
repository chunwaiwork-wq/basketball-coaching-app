import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/student/available-slots — get all available future slots
export async function GET() {
  try {
    const slots = await prisma.coachingSlot.findMany({
      where: {
        status: "available",
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
