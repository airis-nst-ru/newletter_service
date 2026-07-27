import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const localPrisma = new PrismaClient();

// PATCH: update comment (resolve/unresolve)
// POST: add a reply to comment
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { id, commentId } = await context.params;
    const body = await req.json();
    const { resolved, content } = body as { resolved?: boolean; content?: string };

    const comment = await localPrisma.comment.findUnique({ where: { id: commentId }, include: { newsletter: true } });
    if (!comment || comment.newsletterId !== id) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    // Only newsletter owner (editor) or approver may toggle resolution
    const newsletter = await localPrisma.newsletter.findUnique({ where: { id } });
    if (!newsletter) return NextResponse.json({ success: false, message: "Newsletter not found" }, { status: 404 });

    if (resolved !== undefined) {
      if (user.accountType !== 'Approver' && newsletter.createdById !== user.id && user.accountType !== 'Editor') {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
      }
    }

    if (content !== undefined) {
      if (comment.authorId !== user.id) {
        return NextResponse.json({ success: false, message: "Only the author can edit this comment" }, { status: 403 });
      }
    }

    const updateData: any = {};
    if (resolved !== undefined) updateData.resolved = Boolean(resolved);
    if (content !== undefined) {
      if (!content.trim()) return NextResponse.json({ success: false, message: "Comment content cannot be empty" }, { status: 400 });
      updateData.content = content.trim();
    }

    const updated = await localPrisma.comment.update({
      where: { id: commentId },
      data: updateData,
      include: { replies: { include: { author: true } }, author: true }
    });
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

    const comment = await localPrisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.newsletterId !== id) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    const created = await localPrisma.commentReply.create({
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

// DELETE: remove a comment and its replies (Approver only)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string; commentId: string }> }) {
  try {
    const user = await verifyToken(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    if (user.accountType !== 'Approver') {
      return NextResponse.json({ success: false, message: "Only approvers may delete comments" }, { status: 403 });
    }

    const { id, commentId } = await context.params;
    const comment = await localPrisma.comment.findUnique({ where: { id: commentId } });
    if (!comment || comment.newsletterId !== id) return NextResponse.json({ success: false, message: "Comment not found" }, { status: 404 });

    // delete replies then comment
    await localPrisma.commentReply.deleteMany({ where: { commentId } });
    await localPrisma.comment.delete({ where: { id: commentId } });

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error("[DELETE /comments/:id]", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}