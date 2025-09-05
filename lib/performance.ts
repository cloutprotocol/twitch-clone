// Performance monitoring utility for development
export const measurePerformance = <T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> => {
  if (process.env.NODE_ENV !== "development") {
    return fn();
  }

  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`⚡ ${label}: ${(end - start).toFixed(2)}ms`);
      resolve(result);
    } catch (error) {
      const end = performance.now();
      console.log(`❌ ${label} failed: ${(end - start).toFixed(2)}ms`);
      reject(error);
    }
  });
};

// Batch multiple async operations with performance tracking
export const batchOperations = async <T>(
  operations: Array<{ fn: () => Promise<T>; label: string }>
): Promise<T[]> => {
  const start = performance.now();
  
  const results = await Promise.all(
    operations.map(({ fn, label }) => measurePerformance(fn, label))
  );
  
  const end = performance.now();
  if (process.env.NODE_ENV === "development") {
    console.log(`🚀 Batch completed: ${(end - start).toFixed(2)}ms`);
  }
  
  return results;
};