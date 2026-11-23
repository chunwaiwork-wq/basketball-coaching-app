import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// POST /api/auth/reset-password — body: { token, password }
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "This reset link is invalid. Please request a new one." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const record = await prisma.passwordReset.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!record) {
      return NextResponse.json(
        { error: "This reset link is invalid. Please request a new one." },
        { status: 400 }
      );
    }
    if (record.usedAt) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one." },
        { status: 400 }
      );
    }
    if (record.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      prisma.passwordReset.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Any other outstanding links for this account stop working too.
      prisma.passwordReset.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      email: record.user.email,
      message: "Password updated. You can sign in now.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please request a new reset link." },
      { status: 500 }
    );
  }
}
