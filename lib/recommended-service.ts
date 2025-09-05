import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getRecommended = async () => {
  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  let users = [];
  if (userId) {
    // Single optimized query that excludes followed and blocked users
    users = await db.user.findMany({
      where: {
        NOT: [
          { id: userId },
          {
            followedBy: {
              some: {
                followerId: userId,
              },
            },
          },
          {
            blockedby: {
              some: {
                blockerId: userId,
              },
            },
          },
        ],
      },
      include: {
        stream: {
          select: {
            isLive: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
      take: 50, // Limit results for better performance
    });
  } else {
    users = await db.user.findMany({
      include: {
        stream: {
          select: {
            isLive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit results for better performance
    });
  }

  return users;
};
