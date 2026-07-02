import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=google_denied", req.url)
      );
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/auth/login?error=config", req.url)
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://basketball-coaching-app-one.vercel.app";

    const oauth2Client = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri: `${baseUrl}/api/auth/google/callback`,
    });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    const email: string = googleUser.email;
    const name: string = googleUser.name || googleUser.email?.split("@")[0] || "Student";

    if (!email) {
      return NextResponse.redirect(
        new URL("/auth/login?error=no_email", req.url)
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new account from Google profile
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: await bcrypt.hash(crypto.randomUUID(), 12), // Random password — they use Google
          role: "student",
        },
      });

      // Also create a lead in the CRM
      await prisma.lead.create({
        data: { name, email },
      }).catch(() => {
        // Lead might already exist, ignore
      });
    }

    // Redirect to a special page that saves to localStorage
    const params = new URLSearchParams({
      userId: user.id.toString(),
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
    });

    return NextResponse.redirect(
      new URL(`/auth/callback?${params.toString()}`, req.url)
    );
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL("/auth/login?error=server_error", req.url)
    );
  }
}
