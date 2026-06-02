import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// PATCH: update comment (resolve/unresolve)
// POST: add a reply to comment
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id, commentId } = await context.params;
    const body = await req.json();
    const { resolved } = body as { resolved?: boolean };

    const comment = await prisma.comment.findUnique({ where: { id: commentId }, include: { newsletter: true } });
    if (!comment || comment.newsletterId !== id) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    // Only newsletter owner (editor) or approver may toggle resolution
    const newsletter = await prisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) return NextResponse.json({ success: false, message: "Newsletter not found" }, { status: 404 });

    if (user.accountType !== 'Approver' && newsletter.createdById !== user.id && user.accountType !== 'Editor') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.comment.update({ where: { id: commentId }, data: { resolved: Boolean(resolved) }, include: { replies: true, author: true } });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /comments/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id, commentId } = await context.params;
    const body = await req.json();
    const { type = 'text', text, voiceUrl } = body as { type?: string; text?: string; voiceUrl?: string };

    if (type === 'text' && (!text || text.trim() === '')) return NextResponse.json({ success: false, message: "Missing text for reply" }, { status: 400 });
    if (type === 'voice' && (!voiceUrl || voiceUrl.trim() === '')) return NextResponse.json({ success: false, message: "Missing voiceUrl for voice reply" }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.newsletterId !== id) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    const created = await prisma.commentReply.create({
      data: {
        commentId,
        authorId: user.id,
        type,
        text: text || null,
        voiceUrl: voiceUrl || null,
      },
      include: { author: true }
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    console.error("[POST /comments/:id/replies]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}