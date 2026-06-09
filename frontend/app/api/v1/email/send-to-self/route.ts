import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendEmail } from "@/services/mail.service";

// POST /api/v1/email/send-to-self
// Body: { newsletterId: string, subject?: string }
// Sends the newsletter to the currently logged-in user's email only.
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { newsletterId, subject } = await req.json();

    if (!newsletterId) {
      return NextResponse.json({ success: false, message: "newsletterId is required" }, { status: 400 });
    }

    // Fetch compiled HTML
    const content = await prisma.newsletterContent.findUnique({
      where: { newsletterId },
    });

    if (!content?.content) {
      return NextResponse.json({ success: false, message: "Newsletter content not found" }, { status: 404 });
    }

    const emailSubject = subject?.trim() || "[Preview] The AIRIS Chronicle";
    const result = await sendEmail(user.email, emailSubject, content.content);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Preview sent to ${user.email}` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
