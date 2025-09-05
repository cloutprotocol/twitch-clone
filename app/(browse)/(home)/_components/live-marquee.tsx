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
    <div className="fixed bottom-0 left-0 w-full bg-black text-white py-3 overflow-hidden shadow-lg z-[10]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...streams, ...streams].map((stream, index) => (
          <Link
            key={`${stream.id}-${index}`}
            href={`/${stream.user.username}`}
            className="inline-flex items-center mx-6 sm:mx-8 hover:text-gray-300 transition-colors z-[1]"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="font-medium text-sm sm:text-base">{stream.user.username}</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="truncate max-w-[150px] sm:max-w-[200px] text-sm sm:text-base hidden sm:inline">
                {stream.title}
              </span>
              <div className="flex items-center space-x-1 text-gray-300">
                <Eye className="w-3 h-3" />
                <span className="text-xs sm:text-sm">{formatViewerCount(stream.viewerCount)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};