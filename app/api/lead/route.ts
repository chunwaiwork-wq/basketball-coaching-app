import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendLeadNotification } from "../../../lib/email";

export async function POST(request: Request) {
  let name: string, email: string;

  try {
    const body = await request.json();
    name = body.name;
    email = body.email;

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

    // Save lead to database
    const lead = await prisma.lead.create({
      data: { name, email },
    });

    // Send notifications (fire-and-forget — don't block the response)
    sendLeadNotification(name, email).catch((err) =>
      console.error("Failed to send lead notification:", err)
    );

    return NextResponse.json({
      success: true,
      downloadUrl: "/free-shooting-guide.pdf",
      leadId: lead.id,
    });
  } catch (error: any) {
    // Handle duplicate email
    if (error?.code === "P2002") {
      // Already signed up — still let them download and notify
      sendLeadNotification(name, email).catch(() => {});
      return NextResponse.json({
        success: true,
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
