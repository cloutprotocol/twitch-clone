"use client";

import { useEffect } from "react";
import { useParticipants } from "@livekit/components-react";

interface UseViewerCountProps {
  streamId: string;
  isHost?: boolean;
}

export const useViewerCount = ({ streamId, isHost = false }: UseViewerCountProps) => {
  const participants = useParticipants();
  
  // Calculate viewer count (exclude host)
  const viewerCount = Math.max(0, participants.length - (isHost ? 1 : 0));

  useEffect(() => {
    // Update viewer count in database every 30 seconds
    const updateViewerCount = async () => {
      try {
        await fetch("/api/viewer-count/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            streamId,
            count: viewerCount,
          }),
        });
      } catch (error) {
        console.error("Failed to update viewer count:", error);
      }
    };

    // Update immediately and then every 5 seconds
    updateViewerCount();
    const interval = setInterval(updateViewerCount, 5000);

    return () => clearInterval(interval);
  }, [streamId, viewerCount]);

  return viewerCount;
};