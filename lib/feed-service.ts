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
        viewerCount: true,
        updatedAt: true,
        _count: {
          select: {
            chatMessages: true,
          },
        },
      },
      orderBy: [
        {
          isLive: "desc",
        },
        {
          viewerCount: "desc",
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
        viewerCount: true,
        updatedAt: true,
        _count: {
          select: {
            chatMessages: true,
          },
        },
      },
      orderBy: [
        {
          isLive: "desc",
        },
        {
          viewerCount: "desc",
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

export const getLiveStreams = async () => {
  return await db.stream.findMany({
    where: {
      isLive: true,
    },
    select: {
      id: true,
      title: true,
      user: {
        select: {
          username: true,
          imageUrl: true,
        },
      },
      viewerCount: true,
    },
    orderBy: {
      viewerCount: "desc",
    },
  });
};
