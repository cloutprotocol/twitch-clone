import { getServerSession } from "next-auth/next";
import { cache } from "react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Cache the getSelf function to avoid repeated DB calls within the same request
export const getSelf = cache(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
});

export const getSelfByUsername = async (username: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (session.user.username !== user.username) {
    throw new Error("Unauthorized");
  }

  return user;
};

// Helper function to get current session
export const getCurrentSession = cache(async () => {
  return await getServerSession(authOptions);
});

// Helper function to check if user is authenticated
export const isAuthenticated = cache(async () => {
  const session = await getServerSession(authOptions);
  return !!session?.user?.id;
});
