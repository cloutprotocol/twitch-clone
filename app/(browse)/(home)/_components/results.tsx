import { db } from "@/lib/db";
import { Skeleton } from "@/components/ui/skeleton";

import { ResultCard, ResultCardSkeleton } from "./result-card";
import { LiveMarquee } from "./live-marquee";

export const Results = async () => {
  // Only fetch live streams for the main page
  const liveStreams = await db.stream.findMany({
    where: {
      isLive: true, // Only get live streams
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
      { viewerCount: "desc" },
      { updatedAt: "desc" },
    ],
    take: 50,
  });

  return (
    <div className="w-full">
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-12">
        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <section>
            <div className="flex items-center space-x-3 mb-8">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 border border-white animate-spin-slow"></div>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Streaming now
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
              {liveStreams.map((stream) => (
                <ResultCard key={stream.id} data={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {liveStreams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 rounded-2xl animate-spin-slow shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-tl from-purple-400 via-blue-400 to-purple-500 rounded-xl"></div>
                <div className="absolute inset-4 bg-gradient-to-br from-purple-300 via-blue-300 to-purple-400 rounded-lg opacity-80"></div>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              No live streams
            </h3>
            <p className="text-muted-foreground text-lg max-w-md">
              No one is streaming right now. Check back soon for live content!
            </p>
          </div>
        )}
      </div>

      {/* Live Streams Marquee - Footer Position */}
      <LiveMarquee streams={liveStreams} />
    </div>
  );
};

export const ResultsSkeleton = () => {
  return (
    <div className="w-full">
      {/* Marquee Skeleton */}
      <div className="w-full bg-muted h-10" />
      
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Live Section Skeleton */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Recommended Section Skeleton */}
        <section>
          <Skeleton className="h-9 w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 sm:gap-6">
            {[...Array(14)].map((_, i) => (
              <ResultCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
