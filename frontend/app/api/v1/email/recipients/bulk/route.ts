import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// ── POST /api/v1/email/recipients/bulk — import many emails ──────────────────
export async function POST(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { emails, isfromUniversity } = await req.json();

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ success: false, message: "emails must be a non-empty array" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid   = emails.map((e: string) => e.trim()).filter((e) => emailRegex.test(e));
    const invalid = emails.length - valid.length;

    // Upsert all in parallel batches of 50
    const CHUNK = 50;
    let created = 0;
    let updated = 0;

    for (let i = 0; i < valid.length; i += CHUNK) {
      const chunk = valid.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map(async (email) => {
          const existing = await prisma.recipients.findUnique({ where: { email } });
          if (existing) {
            await prisma.recipients.update({ where: { email }, data: { isSubscribed: true } });
            updated++;
          } else {
            await prisma.recipients.create({
              data: { email, isfromUniversity: isfromUniversity ?? false, isSubscribed: true },
            });
            created++;
          }
          return email;
        })
      );
      void results;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${created} new, updated ${updated} existing. ${invalid} invalid skipped.`,
      created,
      updated,
      invalid,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ── DELETE /api/v1/email/recipients/bulk — delete many by id ─────────────────
export async function DELETE(req: NextRequest) {
  const user = await verifyToken(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, message: "ids must be a non-empty array" }, { status: 400 });
    }

    const result = await prisma.recipients.deleteMany({ where: { id: { in: ids } } });

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} recipient(s)`,
      count: result.count,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
