"use client";

import { Eye } from "lucide-react";
import { formatViewerCount } from "@/lib/format";

interface LiveViewerCountProps {
  streamId: string;
  initialCount: number;
  isLive: boolean;
  className?: string;
}

export const LiveViewerCount = ({
  streamId,
  initialCount,
  isLive,
  className
}: LiveViewerCountProps) => {
  // For offline streams, show stored count, for live streams show 0 until real data comes
  const viewerCount = isLive ? 0 : initialCount;

  if (!isLive && viewerCount === 0) return null;

  return (
    <div className={className}>
      <Eye className="w-3 h-3" />
      <span>{formatViewerCount(viewerCount)}</span>
    </div>
  );
};