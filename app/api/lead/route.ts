import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

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

    return NextResponse.json({
      success: true,
      downloadUrl: "/free-shooting-guide.pdf",
      leadId: lead.id,
    });
  } catch (error: any) {
    // Handle duplicate email
    if (error?.code === "P2002") {
      // Already signed up — still let them download
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
