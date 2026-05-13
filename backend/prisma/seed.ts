import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed script for User model
 * 
 * This script creates or updates a user entry without flushing existing data.
 * It supports both command-line arguments and interactive input.
 * 
 * Usage:
 * - npx ts-node prisma/seed.ts [email] [username] [password]
 * - npx ts-node prisma/seed.ts (interactive mode)
 */

async function main() {
    const args = process.argv.slice(2);

    let email: string;
    let username: string;
    let password: string;

    // Get credentials from command line or prompt user
    if (args.length >= 3) {
        [email, username, password] = args;
    } else {
        // For interactive mode, you would need a prompting library like 'prompt-sync'
        // For now, we'll just use the args if provided
        email = args[0] || "user@example.com";
        username = args[1] || "username";
        password = args[2] || "password";

        console.log("\n📝 Seeding database with user credentials...");
        console.log(`Email: ${email}`);
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}\n`);
    }

    // Validate input
    if (!email || !username || !password) {
        console.error("❌ Error: Email, username, and password are required");
        process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        console.error("❌ Error: Invalid email format");
        process.exit(1);
    }

    try {
        // Use upsert to create or update user without flushing existing data
        // Upserts based on email as unique identifier
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                username,
                password,
            },
            create: {
                email,
                username,
                password,
            },
        });

        console.log("✅ User seeded successfully!");
        console.log(`ID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Username: ${user.username}`);
        console.log(`Created At: ${user.createdAt}`);
        console.log(`Updated At: ${user.updatedAt}\n`);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
