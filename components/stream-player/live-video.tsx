"use client";

import { useRef, useState, useEffect } from "react";
import { Participant, Track } from "livekit-client";
import { useTracks } from "@livekit/components-react";
import { useEventListener } from "usehooks-ts";

import { VolumeControl } from "./volume-controle";
import { FullscreenControl } from "./fullscreen-control";
import { ThumbnailGenerator } from "@/lib/client-thumbnail-generator";

interface LiveVideoProps {
  participant: Participant;
  streamId?: string;
  showThumbnailControls?: boolean; // Only show controls in dashboard
}

export const LiveVideo = ({ participant, streamId, showThumbnailControls = false }: LiveVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const thumbnailGeneratorRef = useRef<ThumbnailGenerator | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [lastThumbnailTime, setLastThumbnailTime] = useState<string>("");

  const onVolumeChange = (value: number) => {
    setVolume(+value);
    if (videoRef?.current) {
      videoRef.current.muted = value === 0;
      videoRef.current.volume = +value * 0.01;
    }
  };

  const toggleMute = () => {
    const isMuted = volume === 0;

    setVolume(isMuted ? 50 : 0);

    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };

  useEffect(() => {
    onVolumeChange(0);
  }, []);

  // Initialize thumbnail generation when video is ready
  useEffect(() => {
    if (videoRef.current && streamId && !thumbnailGeneratorRef.current) {
      const video = videoRef.current;
      
      // Wait for video to start playing
      const handleVideoPlay = () => {
        // Start automatic thumbnail generation (silent)
        thumbnailGeneratorRef.current = new ThumbnailGenerator(
          video, 
          streamId, 
          30 // Generate thumbnail every 30 seconds
        );
        thumbnailGeneratorRef.current.start();
        
        // Only update UI if controls are shown (dashboard)
        if (showThumbnailControls) {
          setLastThumbnailTime(new Date().toLocaleTimeString());
        }
      };

      video.addEventListener('play', handleVideoPlay);
      
      // If video is already playing
      if (!video.paused) {
        handleVideoPlay();
      }

      return () => {
        video.removeEventListener('play', handleVideoPlay);
        if (thumbnailGeneratorRef.current) {
          thumbnailGeneratorRef.current.stop();
          thumbnailGeneratorRef.current = null;
        }
      };
    }
  }, [streamId]);

  // Manual thumbnail generation for testing
  const generateThumbnailNow = async () => {
    if (videoRef.current && streamId) {
      try {
        console.log("🖼️ Generating thumbnail manually...");
        const { generateAndUploadThumbnail } = await import("@/lib/client-thumbnail-generator");
        
        const thumbnailUrl = await generateAndUploadThumbnail(
          videoRef.current,
          streamId,
          { width: 1280, height: 720, quality: 0.9 }
        );
        
        setLastThumbnailTime(new Date().toLocaleTimeString());
        
        // Show success notification only in dashboard
        if (showThumbnailControls) {
          alert(`Thumbnail generated successfully!`);
        }
      } catch (error) {
        console.error("❌ Failed to generate thumbnail:", error);
        alert("Failed to generate thumbnail. Check console for details.");
      }
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (wrapperRef?.current) {
      wrapperRef.current.requestFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
  };

  useEventListener("fullscreenchange", handleFullscreenChange, wrapperRef);

  useTracks([Track.Source.Camera, Track.Source.Microphone])
    .filter((track) => track.participant.identity === participant.identity)
    .forEach((track) => {
      if (videoRef.current) {
        track.publication.track?.attach(videoRef.current);
      }
    });

  return (
    <div ref={wrapperRef} className="relative h-full flex">
      <video ref={videoRef} width="100%" />
      <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 hover:transition-all">
        {/* Thumbnail Generation Controls - Only show in dashboard */}
        {streamId && showThumbnailControls && (
          <div className="absolute top-4 right-4 bg-black/80 rounded-lg px-3 py-2 text-white text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Thumbnail</span>
            </div>
            {lastThumbnailTime && (
              <div className="text-xs text-gray-300 mt-1">
                Last: {lastThumbnailTime}
              </div>
            )}
            <button
              onClick={generateThumbnailNow}
              className="mt-2 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors"
            >
              Generate Now
            </button>
          </div>
        )}
        
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
          <VolumeControl
            onChange={onVolumeChange}
            value={volume}
            onToggle={toggleMute}
          />
          <FullscreenControl
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
};
