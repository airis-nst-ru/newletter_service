import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/v1/email/feedback — public route, no auth required
export async function POST(req: NextRequest) {
  try {
    const { email, feedback } = await req.json();

    if (!email || !feedback) {
      return NextResponse.json(
        { success: false, message: "email and feedback are required" },
        { status: 400 }
      );
    }

    await prisma.subscribeFeedback.create({
      data: { email: email.trim(), feedback: feedback.trim() },
    });

    return NextResponse.json({ success: true, message: "Feedback recorded. Thank you." });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
