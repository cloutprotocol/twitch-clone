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

  let users: any[] = [];
  
  try {
    if (userId) {
      // Single optimized query that excludes followed and blocked users, only shows live streamers
      users = await db.user.findMany({
      where: {
        AND: [
          {
            stream: {
              isLive: true, // Only show users who are currently live
            },
          },
          {
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
        ],
      },
      include: {
        stream: {
          select: {
            isLive: true,
            viewerCount: true,
          },
        },
      },
      orderBy: [
        {
          stream: {
            viewerCount: "desc", // Prioritize by viewer count
          },
        },
        {
          createdAt: "desc",
        },
      ],
      take: 50, // Limit results for better performance
    });
    } else {
      users = await db.user.findMany({
        where: {
          stream: {
            isLive: true, // Only show users who are currently live
          },
        },
        include: {
          stream: {
            select: {
              isLive: true,
              viewerCount: true,
            },
          },
        },
        orderBy: [
          {
            stream: {
              viewerCount: "desc", // Prioritize by viewer count
            },
          },
          {
            createdAt: "desc",
          },
        ],
        take: 50, // Limit results for better performance
      });
    }
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    // Return empty array on database error
    users = [];
  }

  return users;
};
