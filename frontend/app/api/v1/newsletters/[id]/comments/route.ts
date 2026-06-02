import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET: list comments for a newsletter
// POST: create a comment (Approver only)
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const comments = await prisma.comment.findMany({
      where: { newsletterId: id },
      include: { replies: { include: { author: true } }, author: true },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (err) {
    console.error("[GET /comments]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    if (user.accountType !== "Approver") {
      return NextResponse.json({ success: false, message: "Only approvers may add comments" }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { blockId, content } = body as { blockId: string; content: string };

    if (!blockId || !content) return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });

    const created = await prisma.comment.create({
      data: {
        newsletterId: id,
        blockId,
        content,
        authorId: user.id,
      },
      include: { replies: true, author: true }
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error("[POST /comments]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}