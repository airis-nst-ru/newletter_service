import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// ── PATCH /api/v1/email/recipients/[id] ──────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (typeof body.isSubscribed    === "boolean") data.isSubscribed    = body.isSubscribed;
  if (typeof body.isfromUniversity === "boolean") data.isfromUniversity = body.isfromUniversity;
  if (typeof body.email === "string" && body.email.trim()) data.email = body.email.trim();

  try {
    const updated = await prisma.recipients.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── DELETE /api/v1/email/recipients/[id] ─────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.recipients.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Recipient deleted" });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
