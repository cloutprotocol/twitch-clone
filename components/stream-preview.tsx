"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Track } from "livekit-client";
import { 
  LiveKitRoom, 
  useRemoteParticipant, 
  useTracks 
} from "@livekit/components-react";
import { useViewerToken } from "@/hooks/use-viewer-token";

interface StreamPreviewProps {
  hostIdentity: string;
  className?: string;
  isHovered: boolean;
}

const PreviewVideo = ({ hostIdentity }: { hostIdentity: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const participant = useRemoteParticipant(hostIdentity);
  
  const tracks = useTracks([Track.Source.Camera])
    .filter((track) => track.participant.identity === hostIdentity);

  useEffect(() => {
    const videoTrack = tracks.find((track) => track.source === Track.Source.Camera);
    const videoElement = videoRef.current;
    
    if (videoElement && videoTrack) {
      videoTrack.publication.track?.attach(videoElement);
    }

    return () => {
      if (videoElement && videoTrack) {
        videoTrack.publication.track?.detach(videoElement);
      }
    };
  }, [tracks]);

  if (!participant || tracks.length === 0) {
    return (
      <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      autoPlay
      playsInline
    />
  );
};

export const StreamPreview = ({ hostIdentity, className, isHovered }: StreamPreviewProps) => {
  const { token } = useViewerToken(hostIdentity);
  const [shouldConnect, setShouldConnect] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounce connection to prevent rapid connect/disconnect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isHovered) {
      // Delay connection by 500ms to avoid accidental hovers
      timeoutRef.current = setTimeout(() => {
        setShouldConnect(true);
      }, 500);
    } else {
      // Disconnect immediately when not hovered
      setShouldConnect(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  if (!token || !shouldConnect) {
    return null;
  }

  return (
    <div className={className}>
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL!}
        connect={true}
        audio={false}
        video={false}
        options={{
          // Optimize for preview usage
          adaptiveStream: false,
          dynacast: false,
          publishDefaults: {
            videoSimulcastLayers: [],
            audioPreset: undefined,
          },
        }}
      >
        <PreviewVideo hostIdentity={hostIdentity} />
      </LiveKitRoom>
    </div>
  );
};