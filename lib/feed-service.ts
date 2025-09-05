import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getStreams = async (limit: number = 50) => {
  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  let streams = [];

  if (userId) {
    streams = await db.stream.findMany({
      where: {
        user: {
          NOT: {
            blocking: {
              some: {
                blockedId: userId,
              },
            },
          },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        isLive: true,
        title: true,
        thumbnail: true,
        updatedAt: true,
      },
      orderBy: [
        {
          isLive: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: limit,
    });
  } else {
    streams = await db.stream.findMany({
      select: {
        id: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
        isLive: true,
        title: true,
        thumbnail: true,
        updatedAt: true,
      },
      orderBy: [
        {
          isLive: "desc",
        },
        {
          updatedAt: "desc",
        },
      ],
      take: limit,
    });
  }

  return streams;
};
