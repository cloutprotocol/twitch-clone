import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const getSearch = async (term?: string) => {
  let userId;

  try {
    const self = await getSelf();
    userId = self.id;
  } catch {
    userId = null;
  }

  if (!term) {
    return [];
  }

  let streams = [];

  // Use MongoDB aggregation for case-insensitive search
  const pipeline: any[] = [
    {
      $lookup: {
        from: "User",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    },
    {
      $unwind: "$user"
    },
    {
      $match: {
        $or: [
          {
            title: {
              $regex: term,
              $options: "i" // case-insensitive
            }
          },
          {
            "user.username": {
              $regex: term,
              $options: "i" // case-insensitive
            }
          },
          {
            "user.bio": {
              $regex: term,
              $options: "i" // case-insensitive
            }
          }
        ]
      }
    }
  ];

  // Add user filtering for authenticated users
  if (userId) {
    pipeline.push({
      $match: {
        "user._id": { $ne: { $toObjectId: userId } }
      }
    });
  }

  // Add sorting and limiting
  pipeline.push(
    {
      $sort: {
        isLive: -1,
        updatedAt: -1
      }
    },
    {
      $limit: 50
    },
    {
      $project: {
        _id: 1,
        title: 1,
        isLive: 1,
        thumbnail: 1,
        updatedAt: 1,
        "user._id": 1,
        "user.username": 1,
        "user.imageUrl": 1,
        "user.bio": 1
      }
    }
  );

  try {
    // Use raw MongoDB aggregation for case-insensitive search
    const results = await db.stream.aggregateRaw({
      pipeline
    });

    // Transform the results to match expected format
    streams = (results as any[]).map((result: any) => ({
      id: result._id.$oid,
      title: result.title,
      isLive: result.isLive,
      thumbnail: result.thumbnail,
      updatedAt: new Date(result.updatedAt.$date),
      user: {
        id: result.user._id.$oid,
        username: result.user.username,
        imageUrl: result.user.imageUrl,
        bio: result.user.bio
      }
    }));
  } catch (error) {
    console.error("Search aggregation failed, falling back to simple search:", error);
    
    // Fallback to simple case-sensitive search if aggregation fails
    const searchConditions = {
      OR: [
        {
          title: {
            contains: term,
          },
        },
        {
          user: {
            username: {
              contains: term,
            },
          },
        },
      ],
    };

    if (userId) {
      streams = await db.stream.findMany({
        where: {
          user: {
            NOT: {
              id: userId,
            },
          },
          ...searchConditions,
        },
        select: {
          user: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
              bio: true,
            },
          },
          id: true,
          title: true,
          isLive: true,
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
        take: 50,
      });
    } else {
      streams = await db.stream.findMany({
        where: searchConditions,
        select: {
          user: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
              bio: true,
            },
          },
          id: true,
          title: true,
          isLive: true,
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
        take: 50,
      });
    }
  }
  
  return streams;
};
