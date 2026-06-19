import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendLeadNotification, sendGuideToLead } from "../../../lib/email";

export async function POST(request: Request) {
  let body: { name?: string; email?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    // Save lead to database
    const lead = await prisma.lead.create({
      data: { name, email },
    });

    // Fire notifications and email guide (in parallel with response)
    const [notificationResult, guideResult] = await Promise.allSettled([
      sendLeadNotification(name, email),
      sendGuideToLead(name, email),
    ]);

    if (notificationResult.status === "rejected") {
      console.error("Owner notification failed:", notificationResult.reason);
    }
    if (guideResult.status === "rejected") {
      console.error("Guide email failed:", guideResult.reason);
    }

    return NextResponse.json({
      success: true,
      message: "Guide is on its way to your inbox!",
      downloadUrl: "/free-shooting-guide.pdf",
      leadId: lead.id,
    });
  } catch (error: any) {
    // Handle duplicate email (already signed up before)
    if (error?.code === "P2002") {
      // Still send the guide again
      sendGuideToLead(name, email).catch((err) =>
        console.error("Guide email failed (duplicate):", err)
      );

      return NextResponse.json({
        success: true,
        message: "You already signed up! We've re-sent the guide to your inbox.",
        downloadUrl: "/free-shooting-guide.pdf",
        alreadyExists: true,
      });
    }

    console.error("Lead capture error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
