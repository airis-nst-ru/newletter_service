import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  // Path to emails.json
  const emailsPath = path.resolve(process.cwd(), "../.projectContext/emails.json");
  console.log("Reading emails from:", emailsPath);

  if (!fs.existsSync(emailsPath)) {
    throw new Error(`emails.json not found at ${emailsPath}`);
  }

  const fileContent = fs.readFileSync(emailsPath, "utf-8");
  const emails: string[] = JSON.parse(fileContent);
  console.log(`Loaded ${emails.length} emails from JSON.`);

  let successCount = 0;
  const batchSize = 100;

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (emailStr) => {
        const email = emailStr.trim().toLowerCase();
        if (!email) return;

        try {
          await prisma.recipients.upsert({
            where: { email },
            update: {
              isfromUniversity: true,
              isSubscribed: true,
            },
            create: {
              email,
              isfromUniversity: true,
              isSubscribed: true,
            },
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to upsert email ${email}:`, err);
        }
      })
    );
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(emails.length / batchSize)}`);
  }

  console.log(`Successfully seeded ${successCount} university recipients.`);
}

main()
  .catch((err) => {
    console.error("Error seeding emails:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
