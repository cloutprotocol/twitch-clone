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
    <div className="w-full min-h-screen">
      {/* Content Container */}
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 space-y-12">
        {/* Live Streams Section */}
        {liveStreams.length > 0 && (
          <section>
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="w-8 h-8 bg-streaming-live rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="absolute -inset-1 bg-streaming-live rounded-full opacity-20 animate-ping"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                  Streaming now
                  <span className="text-sm font-normal text-text-secondary bg-background-secondary px-2 py-1 rounded-full">
                    {liveStreams.length}
                  </span>
                </h2>
                <p className="text-text-secondary text-sm mt-1">Live content happening right now</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
              {liveStreams.map((stream) => (
                <ResultCard key={stream.id} data={stream} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {liveStreams.length === 0 && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            {/* Offline Icon */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-background-secondary border-2 border-border-primary rounded-3xl flex items-center justify-center shadow-lg">
                {/* Simple Offline Symbol - Circle with diagonal line */}
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-text-tertiary rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-0.5 bg-text-tertiary rotate-45 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 max-w-lg">
              <h3 className="text-4xl font-bold text-text-primary">
                No live streams
              </h3>
              <p className="text-text-secondary text-lg leading-relaxed">
                No one is streaming right now. Check back soon for live content, or be the first to go live!
              </p>
              
              {/* Call to action */}
              <div className="pt-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-background-secondary border border-border-primary rounded-full text-text-secondary hover:text-text-primary hover:border-interactive-primary transition-all duration-200">
                  <div className="w-2 h-2 bg-text-tertiary rounded-full"></div>
                  <span className="text-sm font-medium">Waiting for streamers...</span>
                </div>
              </div>
            </div>
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
