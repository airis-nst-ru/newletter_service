import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { generateHtmlFromBlocks, validateBlocks } from "@/lib/htmlCompiler";
import { MongoClient, ObjectId } from "mongodb";

const mongoClient = new MongoClient(process.env.DATABASE_URL!);

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

    // Auth check using Prisma (reads are fine without replica set)
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

    if (Array.isArray(state)) {
      const validation = validateBlocks(state);
      if (!validation.valid) {
        return NextResponse.json({ success: false, message: "Invalid block state", errors: validation.errors }, { status: 422 });
      }
      warnings = validation.warnings;
      compiledHtml = generateHtmlFromBlocks(state);
      stateToStore = state;
    } else if (typeof state === "string") {
      stateToStore = state;
    } else {
      return NextResponse.json({ success: false, message: "Invalid field: state must be an array or a string" }, { status: 400 });
    }

    // Use native MongoDB driver for writes (avoids Prisma replica set requirement)
    await mongoClient.connect();
    const db = mongoClient.db();
    const now = new Date();
    const newsletterObjectId = new ObjectId(id);

    const existingContent = await db.collection("NewsletterContent").findOne({ newsletterId: newsletterObjectId });

    if (existingContent) {
      await db.collection("NewsletterContent").updateOne(
        { newsletterId: newsletterObjectId },
        { $set: { content: compiledHtml, state: stateToStore, updatedAt: now } }
      );
    } else {
      await db.collection("NewsletterContent").insertOne({
        newsletterId: newsletterObjectId,
        title: newsletter.content?.title || "Untitled Newsletter",
        content: compiledHtml,
        state: stateToStore,
        variables: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      updatedAt: now,
      compiledHtml,
      state: state,
      warnings,
    });
  } catch (error) {
    console.error("[PATCH /state]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
