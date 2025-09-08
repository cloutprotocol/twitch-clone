import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function migrateClerkUsers() {
  console.log("Starting Clerk user migration...");

  try {
    // Get all users that have a Clerk externalUserId
    const clerkUsers = await db.user.findMany({
      where: {
        externalUserId: {
          not: null,
        },
        accounts: {
          none: {
            provider: "clerk",
          },
        },
      },
    });

    console.log(`Found ${clerkUsers.length} Clerk users to migrate`);

    for (const user of clerkUsers) {
      // Create a Clerk account record for backward compatibility during transition
      await db.account.create({
        data: {
          userId: user.id,
          type: "oauth",
          provider: "clerk",
          providerAccountId: user.externalUserId!,
        },
      });

      console.log(`Migrated user: ${user.username} (${user.externalUserId})`);
    }

    console.log(`Successfully migrated ${clerkUsers.length} users`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run the migration
migrateClerkUsers()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });