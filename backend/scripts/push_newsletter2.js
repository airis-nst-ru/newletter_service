/**
 * push_newsletter2.js
 *
 * Recreates the accidentally deleted second newsletter for user "yashika".
 * It looks up yashika's user account, creates a new Newsletter record linked
 * to her, then upserts a NewsletterContent record with the v2.ts HTML template.
 *
 * Usage (from the backend/ directory):
 *   node scripts/push_newsletter2.js
 *
 * Optional: override the due date via CLI arg (ISO string):
 *   node scripts/push_newsletter2.js 2026-05-15T00:00:00.000Z
 */

require("dotenv").config(); // loads backend/.env

const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

// ── Parse HTML from v2.ts ─────────────────────────────────────────────────────
const v2TsPath = path.resolve(__dirname, "../src/template/v2.ts");
const raw = fs.readFileSync(v2TsPath, "utf8");

const match = raw.match(/export const template_v2\s*=\s*`([\s\S]*)`\s*$/);
if (!match) {
  console.error("❌  Could not parse template_v2 from v2.ts — check the export format.");
  process.exit(1);
}
const htmlContent = match[1];

// ── Optional CLI arg for due date ─────────────────────────────────────────────
const dueDateArg = process.argv[2];
const dueDate = dueDateArg ? new Date(dueDateArg) : new Date("2026-05-15T00:00:00.000Z");

if (isNaN(dueDate.getTime())) {
  console.error(`❌  Invalid date provided: "${dueDateArg}". Use an ISO date string.`);
  process.exit(1);
}

// ── Push to DB ────────────────────────────────────────────────────────────────
const prisma = new PrismaClient();

async function main() {
  // 1. Find yashika's user record
  const yashika = await prisma.user.findUnique({
    where: { username: "yashika" },
  });

  if (!yashika) {
    console.error("❌  User \"yashika\" not found. Make sure the username exists in the database.");
    process.exit(1);
  }

  console.log(`\n👤  Found user: ${yashika.username} (id: ${yashika.id})\n`);

  // 2. Create the Newsletter record
  const newsletter = await prisma.newsletter.create({
    data: {
      dueDate,
      sent: false,
      supportingNewsSection: false,
      version: 2,
      createdById: yashika.id,
    },
  });

  console.log(`📰  Created Newsletter:`);
  console.log(`    _id     : ${newsletter.id}`);
  console.log(`    version : ${newsletter.version}`);
  console.log(`    dueDate : ${newsletter.dueDate.toISOString()}\n`);

  // 3. Create the NewsletterContent record
  const content = await prisma.newsletterContent.create({
    data: {
      title: "FROM LANGUAGE TO PHYSICAL INTELLIGENCE",
      content: htmlContent,
      newsletterId: newsletter.id,
    },
  });

  console.log(`✅  Done! NewsletterContent created:`);
  console.log(`    _id          : ${content.id}`);
  console.log(`    newsletterId : ${content.newsletterId}`);
  console.log(`    title        : ${content.title}`);
  console.log(`    createdAt    : ${content.createdAt.toISOString()}\n`);
}

main()
  .catch((err) => {
    console.error("❌  Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
