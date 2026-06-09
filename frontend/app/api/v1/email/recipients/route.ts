import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// ── GET /api/v1/email/recipients — list with search + pagination ──────────────
export async function GET(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search       = searchParams.get("search")?.trim() || "";
  const page         = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize     = Math.min(100, parseInt(searchParams.get("pageSize") || "50", 10));
  const filterSub    = searchParams.get("subscribed"); // "true" | "false" | null (all)
  const all          = searchParams.get("all") === "true"; // bypass pagination, return all

  const where: Record<string, unknown> = {};

  if (search) {
    where.email = { contains: search, mode: "insensitive" };
  }
  if (filterSub === "true")  where.isSubscribed = true;
  if (filterSub === "false") where.isSubscribed = false;

  try {
    if (all) {
      // Return all active subscribers (used by confirm-send dialog)
      const recipients = await prisma.recipients.findMany({
        where: { isSubscribed: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ success: true, data: recipients });
    }

    const [total, recipients] = await Promise.all([
      prisma.recipients.count({ where }),
      prisma.recipients.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: recipients,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── POST /api/v1/email/recipients — add a single recipient ───────────────────
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

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
