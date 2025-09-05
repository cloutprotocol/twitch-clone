"use client";

import { useViewerCount } from "@/hooks/use-viewer-count";

interface ViewerTrackerProps {
  /** Database stream ID */
  streamId: string;
  /** Host user ID (also used as LiveKit room name) */
  hostIdentity: string;
  /** Current viewer's identity from LiveKit token */
  viewerIdentity: string;
}

/**
 * ViewerTracker Component
 * 
 * A utility component that tracks LiveKit participant count and updates
 * the database with real viewer numbers. This component must be placed
 * inside a LiveKitRoom context to access participant data.
 * 
 * Purpose:
 * - Updates database with real-time participant count from LiveKit
 * - Enables other parts of the app to use stored viewer count data
 * - Provides backup data source when LiveKit API is unavailable
 * 
 * Context Requirement:
 * This component uses the useViewerCount hook which relies on LiveKit's
 * useParticipants() hook internally. It must be rendered inside a
 * LiveKitRoom component to access the room context.
 * 
 * Host Detection:
 * Determines if current user is the stream host by comparing identities.
 * Host identity follows pattern: `Host-${userId}` (see actions/token.ts:37)
 * This is important for excluding host from viewer count calculations.
 * 
 * @param streamId - Database stream ID to update
 * @param hostIdentity - Host user ID (room owner)
 * @param viewerIdentity - Current viewer's LiveKit identity
 */
export const ViewerTracker = ({
  streamId,
  hostIdentity,
  viewerIdentity,
}: ViewerTrackerProps) => {
  /**
   * Host Identity Check
   * 
   * Host tokens have identity pattern `Host-${userId}` while viewer tokens
   * use just the userId. This check determines if current participant is
   * the host so they can be excluded from viewer count calculations.
   */
  const hostAsViewer = `Host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;
  
  /**
   * Viewer Count Hook
   * 
   * This hook must be inside LiveKitRoom context to access participant data.
   * It automatically updates the database every 5 seconds with current
   * participant count minus host (real viewer count).
   */
  useViewerCount({ streamId, isHost });
  
  // This component is purely functional and renders nothing
  return null;
};