import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  const { pin } = await request.json();

  const student = await prisma.student.findUnique({
    where: { pin },
  });

  if (!student) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  return NextResponse.json({
    studentId: student.id,
    studentName: student.name,
  });
}