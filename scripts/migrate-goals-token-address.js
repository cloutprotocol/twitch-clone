const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateGoalsTokenAddress() {
  try {
    console.log('Starting migration: Cleaning up existing goals...');
    
    // Use raw database operation to delete all existing goals
    // since they don't have the required tokenAddress field
    const result = await prisma.$runCommandRaw({
      delete: "Goal",
      deletes: [
        {
          q: {},
          limit: 0
        }
      ]
    });
    
    console.log('Deleted all existing goals:', result);
    console.log('Migration completed - users will need to create new token-specific goals');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateGoalsTokenAddress();