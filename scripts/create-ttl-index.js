// MongoDB TTL index creation script
// This script creates a TTL (Time To Live) index on the SignNonce collection
// to automatically delete expired nonces after 10 minutes

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function createTTLIndex() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('SignNonce');

    try {
      // First try to drop the existing index
      await collection.dropIndex('SignNonce_expiresAt_idx');
      console.log('Dropped existing index');
    } catch (dropError) {
      console.log('No existing index to drop, continuing...');
    }

    // Create TTL index on expiresAt field
    // Documents will be automatically deleted when expiresAt time is reached
    const result = await collection.createIndex(
      { expiresAt: 1 },
      { 
        expireAfterSeconds: 0,
        name: 'SignNonce_expiresAt_ttl_idx'
      }
    );

    console.log('TTL index created successfully:', result);
  } catch (error) {
    console.error('Error creating TTL index:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
createTTLIndex()
  .then(() => {
    console.log('TTL index setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('TTL index setup failed:', error);
    process.exit(1);
  });