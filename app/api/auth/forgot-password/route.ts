import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "../../../../lib/email";

// Reset links stay valid for 30 minutes and work exactly once.
const TOKEN_TTL_MINUTES = 30;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// POST /api/auth/forgot-password — body: { email }
// Always answers the same way so nobody can probe which emails have accounts.
export async function POST(request: Request) {
  const generic = NextResponse.json({
    success: true,
    message:
      "If that email is registered, a reset link is on its way. Check your inbox (and spam folder).",
  });

  try {
    const body = await request.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    if (!rawEmail) return generic;

    const user = await prisma.user.findFirst({
      where: { email: { equals: rawEmail, mode: "insensitive" } },
    });

    if (user) {
      // Invalidate any earlier unused links for this account.
      await prisma.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000),
        },
      });

      const origin = new URL(request.url).origin;
      const resetUrl = `${origin}/auth/reset?token=${token}`;

      sendPasswordResetEmail(user.name, user.email, resetUrl).catch((err) =>
        console.error("Password reset email failed:", err)
      );
    }

    return generic;
  } catch (error) {
    console.error("Forgot password error:", error);
    return generic;
  }
}
