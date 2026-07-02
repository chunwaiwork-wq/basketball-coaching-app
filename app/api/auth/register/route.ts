import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { sendLeadNotification } from "@/lib/email";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "student" },
    });

    // Also create a lead in the CRM
    await prisma.lead.create({
      data: { name, email },
    }).catch(() => {
      // Lead might already exist (e.g. from trial form), ignore
    });

    // Notify coach on Telegram
    await sendLeadNotification(name, email).catch(() => {});

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
