import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendLeadNotification } from "../../../lib/email";

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

    // Fire notifications asynchronously
    sendLeadNotification(name, email).catch((err) =>
      console.error("Failed to send lead notification:", err)
    );

    return NextResponse.json({
      success: true,
      downloadUrl: "/free-shooting-guide.pdf",
      leadId: lead.id,
    });
  } catch (error: any) {
    // Handle duplicate email (unique constraint violation)
    if (error?.code === "P2002") {
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
