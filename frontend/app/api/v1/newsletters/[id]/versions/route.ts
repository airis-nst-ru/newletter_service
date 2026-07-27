import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { MongoClient, ObjectId } from "mongodb";

const mongoClient = new MongoClient(process.env.DATABASE_URL!);

// GET /api/v1/newsletters/[id]/versions
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const versions = await prisma.newsletterVersion.findMany({
      where: { newsletterId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, versions });
  } catch (error) {
    console.error("[GET /versions]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/v1/newsletters/[id]/versions
export async function POST(
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
    const { name, description, state, content } = body;

    if (!state || !content) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: state or content" },
        { status: 400 }
      );
    }

    // Use native MongoDB driver to avoid replica set requirement
    await mongoClient.connect();
    const db = mongoClient.db();
    const now = new Date();

    const result = await db.collection("NewsletterVersion").insertOne({
      newsletterId: new ObjectId(id),
      name: name || `Version — ${now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
      description: description || "",
      state,
      content,
      createdById: new ObjectId(user.id),
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      version: { id: result.insertedId.toString(), createdAt: now }
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /versions]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
