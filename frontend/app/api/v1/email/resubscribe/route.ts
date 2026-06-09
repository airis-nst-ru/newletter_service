import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/v1/email/resubscribe
// Body: { email: string }
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }

    const trimmed = email.trim();

    await prisma.recipients.upsert({
      where: { email: trimmed },
      update: { isSubscribed: true },
      create: { email: trimmed, isSubscribed: true },
    });

    return NextResponse.json({ success: true, message: "Resubscribed successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
