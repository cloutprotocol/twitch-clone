const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function purgeDatabase() {
  try {
    console.log('Starting database purge...');
    
    // Delete in the correct order to respect foreign key constraints
    console.log('Deleting chat messages...');
    await prisma.chatMessage.deleteMany({});
    
    console.log('Deleting follows...');
    await prisma.follow.deleteMany({});
    
    console.log('Deleting blocks...');
    await prisma.block.deleteMany({});
    
    console.log('Deleting streams...');
    await prisma.stream.deleteMany({});
    
    console.log('Deleting sessions...');
    await prisma.session.deleteMany({});
    
    console.log('Deleting accounts...');
    await prisma.account.deleteMany({});
    
    console.log('Deleting wallets...');
    await prisma.wallet.deleteMany({});
    
    console.log('Deleting users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database purged successfully!');
    console.log('All users, streams, and related data have been removed.');
    
  } catch (error) {
    console.error('❌ Error purging database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

purgeDatabase();