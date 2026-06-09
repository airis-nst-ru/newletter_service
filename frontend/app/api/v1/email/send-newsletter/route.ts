import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendBulkEmail } from "@/services/mail.service";

// POST /api/v1/email/send-newsletter
// Body: { newsletterId: string, emails: string[], subject?: string }
// Fetches compiled HTML from DB and sends to the provided list.
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newsletterId, emails, subject } = await req.json();

    if (!newsletterId) {
      return NextResponse.json({ success: false, message: "newsletterId is required" }, { status: 400 });
    }
    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, message: "emails must be a non-empty array" }, { status: 400 });
    }

    // Fetch compiled HTML from DB
    const content = await prisma.newsletterContent.findUnique({
      where: { newsletterId },
    });

    if (!content?.content) {
      return NextResponse.json({ success: false, message: "Newsletter content not found" }, { status: 404 });
    }

    const emailSubject = subject?.trim() || "The AIRIS Chronicle";
    const results = await sendBulkEmail(emails, emailSubject, content.content);

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent to ${succeeded} recipient(s), ${failed} failed`,
      total: emails.length,
      succeeded,
      failed,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
