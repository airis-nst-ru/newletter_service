/**
 * push_v2_content.js
 *
 * Pushes the HTML content from v2.ts into the NewsletterContent collection
 * via Prisma.
 *
 * Usage (from the backend/ directory):
 *   node scripts/push_v2_content.js <newsletterId>
 *
 * <newsletterId> — ObjectId string of the Newsletter record this content
 *                  belongs to.
 *
 * If a NewsletterContent already exists for this newsletterId it will be
 * updated. Otherwise a new record is created.
 */

require("dotenv").config(); // loads backend/.env

const { PrismaClient } = require("@prisma/client");
const path = require("path");
const fs = require("fs");

// ── Parse HTML from v2.ts ─────────────────────────────────────────────────────
const v2TsPath = path.resolve(__dirname, "../src/template/v2.ts");
const raw = fs.readFileSync(v2TsPath, "utf8");

// The file exports: export const template_v2 = `...`;
// Grab everything between the first ` after the = and the trailing `
const match = raw.match(/export const template_v2\s*=\s*`([\s\S]*)`\s*$/);
if (!match) {
  console.error("❌  Could not parse template_v2 from v2.ts — check the export format.");
  process.exit(1);
}
const htmlContent = match[1];

// ── CLI arg ───────────────────────────────────────────────────────────────────
const newsletterId = process.argv[2];
if (!newsletterId) {
  console.error("❌  Please provide the newsletterId as the first argument.");
  console.error("    node scripts/push_v2_content.js <newsletterId>");
  process.exit(1);
}

// ── Push to DB ────────────────────────────────────────────────────────────────
const prisma = new PrismaClient();

async function main() {
  console.log(`\n📦  Upserting NewsletterContent for newsletterId: ${newsletterId}\n`);

  const result = await prisma.newsletterContent.upsert({
    where: { newsletterId },
    update: {
      title: "FROM LANGUAGE TO PHYSICAL INTELLIGENCE",
      content: htmlContent,
      updatedAt: new Date(),
    },
    create: {
      title: "FROM LANGUAGE TO PHYSICAL INTELLIGENCE",
      content: htmlContent,
      newsletterId,
    },
  });

  console.log(`✅  Done!`);
  console.log(`   NewsletterContent _id : ${result.id}`);
  console.log(`   newsletterId          : ${result.newsletterId}`);
  console.log(`   updatedAt             : ${result.updatedAt.toISOString()}\n`);
}

main()
  .catch((err) => {
    console.error("❌  Error:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
