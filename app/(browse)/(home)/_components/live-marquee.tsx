"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatViewerCount } from "@/lib/format";

interface LiveStream {
  id: string;
  title: string;
  user: {
    username: string;
    imageUrl: string;
  };
  viewerCount: number;
}

interface LiveMarqueeProps {
  streams: LiveStream[];
}

export const LiveMarquee = ({ streams }: LiveMarqueeProps) => {
  if (streams.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background-secondary border-t border-border-primary text-text-primary py-2 overflow-hidden shadow-lg z-[10]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...streams, ...streams].map((stream, index) => (
          <Link
            key={`${stream.id}-${index}`}
            href={`/${stream.user.username}`}
            className="inline-flex items-center mx-4 sm:mx-6 hover:text-text-secondary transition-colors z-[1]"
          >
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-streaming-live rounded-full animate-pulse" />
              <span className="font-medium text-xs sm:text-sm">{stream.user.username}</span>
              <span className="text-text-tertiary hidden sm:inline text-xs">•</span>
              <span className="truncate max-w-[120px] sm:max-w-[160px] text-xs sm:text-sm hidden sm:inline">
                {stream.title}
              </span>
              <div className="flex items-center space-x-1 text-text-tertiary">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{formatViewerCount(stream.viewerCount)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};