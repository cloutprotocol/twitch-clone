import { db } from "@/lib/db";
import { UserItem } from "./user-item";

export const LiveStreamers = async () => {
  let liveStreamers: any[] = [];
  
  try {
    // Fetch live streamers
    liveStreamers = await db.stream.findMany({
      where: {
        isLive: true,
      },
      select: {
        id: true,
        viewerCount: true,
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { viewerCount: "desc" },
        { updatedAt: "desc" },
      ],
      take: 10, // Limit to 10 live streamers for the sidebar
    });
  } catch (error) {
    console.error("Error fetching live streamers for sidebar:", error);
    // Return null on error to hide the component
    return null;
  }

  if (liveStreamers.length === 0) {
    return null;
  }

  return (
    <div>
      <ul className="space-y-1 px-2">
        {liveStreamers.map((stream) => (
          <UserItem
            key={stream.user.id}
            username={stream.user.username}
            imageUrl={stream.user.imageUrl}
            isLive={true}
            viewerCount={stream.viewerCount}
          />
        ))}
      </ul>
    </div>
  );
};

export const LiveStreamersSkeleton = () => {
  return (
    <div>
      <ul className="space-y-1 px-2">
        {[...Array(3)].map((_, i) => (
          <li key={i} className="flex items-center gap-x-4 px-3 py-2">
            <div className="relative">
              <div className="bg-muted min-h-[32px] min-w-[32px] rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-12"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};