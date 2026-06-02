import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateHtmlFromBlocks, validateBlocks } from "@/lib/htmlCompiler";
import { Block } from "@/types/types";

// PATCH /api/v1/newsletters/:id/state
// Body: { state: Block[] }
// Returns: { success, updatedAt, compiledHtml, warnings }
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { state } = body as { state: any };

    if (state === undefined || state === null) {
      return NextResponse.json(
        { success: false, message: "Missing field: state" },
        { status: 400 }
      );
    }

    // Auth check
    const newsletter = await prisma.newsletter.findUnique({ where: { id }, include: { content: true } });
    if (!newsletter) {
      return NextResponse.json({ success: false, message: "Newsletter not found" }, { status: 404 });
    }

    if (newsletter.createdById !== user.id && user.accountType !== "Approver") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    let compiledHtml = newsletter.content?.content || "";
    let stateToStore: any = state;
    let warnings: string[] = [];

    // If the client sent an array of blocks, validate and recompile HTML
    if (Array.isArray(state)) {
      const validation = validateBlocks(state);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: "Invalid block state", errors: validation.errors }, { status: 422 });
      }
      warnings = validation.warnings;
      compiledHtml = generateHtmlFromBlocks(state);
      stateToStore = state; // store array (Prisma Json field)
    } else if (typeof state === 'string') {
      // allow sentinel strings (e.g., "seeking approval") to be stored as state
      stateToStore = state;
    } else {
      return NextResponse.json({ success: false, message: "Invalid field: state must be an array or a string" }, { status: 400 });
    }

    // Upsert NewsletterContent with compiled HTML + block state (state stored as Json)
    const updated = await prisma.newsletterContent.upsert({
      where: { newsletterId: id },
      create: {
        newsletterId: id,
        title: "Untitled Newsletter",
        content: compiledHtml,
        state: stateToStore,
      },
      update: {
        content: compiledHtml,
        state: stateToStore,
      },
    });

    return NextResponse.json({
      success: true,
      updatedAt: updated.updatedAt,
      compiledHtml,
      // Return the canonical saved state (parsed) so frontend can reconcile if needed
      state: state,
      warnings,
    });
  } catch (error) {
    console.error("[PATCH /state]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
