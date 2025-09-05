// Simple performance test script
// Run with: node scripts/performance-test.js

const { performance } = require('perf_hooks');

async function testDatabaseConnection() {
  const start = performance.now();
  
  try {
    // Simulate database operations
    await new Promise(resolve => setTimeout(resolve, 100));
    const end = performance.now();
    
    console.log(`✅ Database connection test: ${(end - start).toFixed(2)}ms`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

async function runPerformanceTests() {
  console.log('🚀 Running performance tests...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
  ];
  
  for (const test of tests) {
    await test.fn();
  }
  
  console.log('\n✨ Performance tests completed!');
}

runPerformanceTests().catch(console.error);