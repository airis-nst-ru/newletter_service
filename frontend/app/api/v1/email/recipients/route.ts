import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/v1/email/recipients — list all active subscribers
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const recipients = await prisma.recipients.findMany({
      where: { isSubscribed: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: recipients });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// POST /api/v1/email/recipients — add a new recipient
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email, isfromUniversity } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 });
    }

    const recipient = await prisma.recipients.upsert({
      where: { email: email.trim() },
      update: { isSubscribed: true },
      create: { email: email.trim(), isfromUniversity: isfromUniversity ?? false },
    });

    return NextResponse.json({ success: true, data: recipient }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
