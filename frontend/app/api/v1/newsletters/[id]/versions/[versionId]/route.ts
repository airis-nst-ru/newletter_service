import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET /api/v1/newsletters/[id]/versions/[versionId]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string, versionId: string }> }
) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, versionId } = await context.params;

    const version = await prisma.newsletterVersion.findFirst({
      where: { id: versionId, newsletterId: id },
    });

    if (!version) {
      return NextResponse.json({ success: false, message: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, version });
  } catch (error) {
    console.error("[GET /versions/:versionId]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
