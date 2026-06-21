import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/student/bookings?studentId=X — get student's bookings
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = parseInt(searchParams.get("studentId") || "");

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const bookings = await prisma.coachingSlot.findMany({
      where: {
        studentId,
        status: { not: "cancelled" },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
