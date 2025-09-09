// Simple admin check - you can expand this based on your needs
const ADMIN_EMAILS = [
  // Add admin email addresses here
  "admin@example.com",
];

const ADMIN_USER_IDS: string[] = [
  // Add admin user IDs here if using Clerk
];

export const isAdmin = (email?: string | null, userId?: string | null): boolean => {
  if (email && ADMIN_EMAILS.includes(email)) {
    return true;
  }
  
  if (userId && ADMIN_USER_IDS.includes(userId)) {
    return true;
  }
  
  return false;
};

export const requireAdmin = (email?: string | null, userId?: string | null): void => {
  if (!isAdmin(email, userId)) {
    throw new Error("Admin access required");
  }
};