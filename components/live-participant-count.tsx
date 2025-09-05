"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { formatViewerCount } from "@/lib/format";

interface LiveParticipantCountProps {
  /** The stream ID to fetch participant count for */
  streamId: string;
  /** CSS classes to apply to the component */
  className?: string;
  /** Whether the stream is currently live */
  isLive: boolean;
  /** Fallback count to show for offline streams (e.g., total views) */
  fallbackCount?: number;
}

/**
 * LiveParticipantCount Component
 * 
 * Displays real-time viewer count for live streams by fetching participant data
 * from LiveKit server via API. This ensures consistency between home page cards
 * and individual stream pages without creating multiple WebSocket connections.
 * 
 * Key Features:
 * - Shows real-time participant count for live streams
 * - Falls back to stored view count for offline streams  
 * - Polls LiveKit API every 5 seconds to stay synchronized
 * - Avoids multiple LiveKit connections that caused audio context issues
 * 
 * Data Flow:
 * 1. Stream page: LiveKit useParticipants() hook shows real-time count
 * 2. API endpoint: Queries LiveKit server for participant count by userId (room name)
 * 3. Home page: This component fetches from API to stay in sync
 * 
 * @param streamId - Database stream ID (converted to userId for LiveKit room lookup)
 * @param isLive - Whether stream is currently broadcasting
 * @param fallbackCount - View count to show for offline streams
 * @param className - CSS classes for styling
 */
export const LiveParticipantCount = ({
  streamId,
  className,
  isLive,
  fallbackCount = 0,
}: LiveParticipantCountProps) => {
  // Initialize with fallback count for offline streams, will be updated for live streams
  const [viewerCount, setViewerCount] = useState(fallbackCount);
  
  useEffect(() => {
    // For offline streams, just use the fallback count (typically stored view count)
    if (!isLive) {
      setViewerCount(fallbackCount);
      return;
    }

    /**
     * Fetches current participant count from LiveKit via our API endpoint
     * The API handles the streamId -> userId conversion for proper room lookup
     */
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch(`/api/stream/${streamId}/participants`);
        if (response.ok) {
          const data = await response.json();
          // Update with real-time count from LiveKit server
          setViewerCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch participant count:", error);
        // Reset to 0 on error to avoid showing stale data
        setViewerCount(0);
      }
    };

    // For live streams: fetch immediately and then poll every 5 seconds
    // This keeps home page synchronized with stream page participant counts
    fetchParticipantCount();
    const interval = setInterval(fetchParticipantCount, 5000);

    // Cleanup interval on component unmount or dependency change
    return () => clearInterval(interval);
  }, [streamId, isLive, fallbackCount]);

  // Hide component if offline stream has no views
  if (!isLive && viewerCount === 0) return null;

  return (
    <div className={className}>
      <Eye className="w-3 h-3" />
      <span>
        {formatViewerCount(viewerCount)}
        {/* Add "views" suffix for offline streams to distinguish from live viewer count */}
        {!isLive && viewerCount > 0 ? " views" : ""}
      </span>
    </div>
  );
};