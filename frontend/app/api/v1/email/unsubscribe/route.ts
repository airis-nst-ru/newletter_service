import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/v1/email/unsubscribe
// Body: { email: string }
// Called by the unsubscribe page (server action or client fetch) to remove from mailing list
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    // Mark as unsubscribed (soft delete — preserves record for reporting)
    const existing = await prisma.recipients.findUnique({ where: { email: trimmed } });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Email not found in subscribers list" }, { status: 404 });
    }

    if (!existing.isSubscribed) {
      return NextResponse.json({ success: true, message: "Already unsubscribed" });
    }

    await prisma.recipients.update({
      where: { email: trimmed },
      data: { isSubscribed: false },
    });

    return NextResponse.json({ success: true, message: "Unsubscribed successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// GET /api/v1/email/unsubscribe?token=<base64url>
// Handles direct link clicks from emails
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  let email = "";
  if (token) {
    try {
      email = Buffer.from(token, "base64url").toString("utf-8").trim();
    } catch {
      return NextResponse.redirect(new URL("/unsubscribe?error=invalid_token", req.url));
    }
  } else if (emailParam) {
    email = emailParam.trim();
  }

  if (!email) {
    return NextResponse.redirect(new URL("/unsubscribe?error=missing_email", req.url));
  }

  try {
    const existing = await prisma.recipients.findUnique({ where: { email } });

    if (existing && existing.isSubscribed) {
      await prisma.recipients.update({
        where: { email },
        data: { isSubscribed: false },
      });
    }

    const redirectToken = Buffer.from(email).toString("base64url");
    return NextResponse.redirect(
      new URL(`/unsubscribe?token=${redirectToken}`, req.url)
    );
  } catch {
    return NextResponse.redirect(new URL("/unsubscribe?error=server_error", req.url));
  }
}
