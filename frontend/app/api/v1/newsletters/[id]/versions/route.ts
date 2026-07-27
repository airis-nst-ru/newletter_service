import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
// Body: { name?: string, description?: string, state: any, content: string }
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

    const version = await prisma.newsletterVersion.create({
      data: {
        newsletterId: id,
        name: name || `Version - ${new Date().toLocaleString()}`,
        description: description || "",
        state,
        content,
        createdById: user.id,
      },
    });

    return NextResponse.json({ success: true, version: { id: version.id, createdAt: version.createdAt } }, { status: 201 });
  } catch (error) {
    console.error("[POST /versions]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
