"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectionState } from "livekit-client";
import { useMediaQuery } from "usehooks-ts";
import {
  useChat,
  useConnectionState,
  useRemoteParticipant,
  ReceivedChatMessage,
} from "@livekit/components-react";

import { ChatVariant, useChatSidebar } from "@/store/use-chat-sidebar";
import { onSendMessage } from "@/actions/chat";

import { ChatForm, ChatFormSkeleton } from "./chat-form";
import { ChatList, ChatListSkeleton } from "./chat-list";
import { ChatHeader, ChatHeaderSkeleton } from "./chat-header";
import { ChatCommunity } from "./chat-community";

interface ChatMessage {
  id: string;
  content: string;
  username: string;
  userId?: string;
  createdAt: Date;
  user?: {
    id: string;
    username: string;
    imageUrl: string;
  };
}

interface ChatProps {
  hostName: string;
  hostIdentity: string;
  viewerName: string;
  isFollowing: boolean;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  streamId: string;
  initialMessages?: ChatMessage[];
}

export const Chat = ({
  hostName,
  hostIdentity,
  viewerName,
  isFollowing,
  isChatEnabled,
  isChatDelayed,
  isChatFollowersOnly,
  streamId,
  initialMessages = [],
}: ChatProps) => {
  const matches = useMediaQuery("(max-width: 1024px)");
  const { variant, onExpand } = useChatSidebar((state) => state);
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);

  const isOnline = participant && connectionState === ConnectionState.Connected;
  const isHidden = !isChatEnabled || !isOnline;

  const [value, setValue] = useState("");
  const [persistedMessages, setPersistedMessages] = useState<ChatMessage[]>(initialMessages);
  const { chatMessages: liveMessages, send } = useChat();
  const [hasConnected, setHasConnected] = useState(false);

  useEffect(() => {
    if (matches) {
      onExpand();
    }
  }, [matches, onExpand]);

  // Track when we first connect to LiveKit
  useEffect(() => {
    if (isOnline && !hasConnected) {
      setHasConnected(true);
    }
  }, [isOnline, hasConnected]);

  // Convert persisted messages to LiveKit format for display
  const convertedPersistedMessages: any[] = useMemo(() => {
    return persistedMessages.map((msg) => ({
      message: msg.content,
      from: {
        identity: msg.userId || `guest-${msg.username}`,
        name: msg.username,
      },
      timestamp: msg.createdAt.getTime(),
      id: msg.id,
    }));
  }, [persistedMessages]);

  // Always show persisted messages + live messages, with smart deduplication
  const displayMessages = useMemo(() => {
    // Always start with persisted messages as the foundation
    const baseMessages = [...convertedPersistedMessages];
    
    // Add live messages that aren't already in persisted messages
    const liveMessagesToAdd = liveMessages.filter(liveMsg => {
      // Check if this live message is already in persisted messages
      // We'll consider it a duplicate if same user + same content within 10 seconds
      return !baseMessages.some(persistedMsg => 
        persistedMsg.from.name === liveMsg.from?.name &&
        persistedMsg.message === liveMsg.message &&
        Math.abs(persistedMsg.timestamp - liveMsg.timestamp) < 10000
      );
    });
    
    // Combine and sort by timestamp
    const allMessages = [...baseMessages, ...liveMessagesToAdd];
    return allMessages.sort((a, b) => b.timestamp - a.timestamp);
  }, [convertedPersistedMessages, liveMessages]);

  const onSubmit = async () => {
    if (!value.trim()) return;

    // Send via LiveKit for real-time display
    if (send) {
      send(value);
    }

    // Persist to database (will appear on refresh)
    try {
      await onSendMessage(streamId, value, viewerName);
      // Don't add to persistedMessages - let LiveKit handle real-time display
      // The message will appear in initialMessages on next page load
    } catch (error) {
      console.error("Failed to persist message:", error);
    }

    setValue("");
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  return (
    <div className="flex flex-col bg-background border-l border-b pt-0 h-[calc(100vh-80px)]">
      <ChatHeader />
      {variant === ChatVariant.CHAT && (
        <>
          <ChatList messages={displayMessages} isHidden={isHidden} />
          <ChatForm
            onSubmit={onSubmit}
            value={value}
            onChange={onChange}
            isHidden={isHidden}
            isFollowersOnly={isChatFollowersOnly}
            isDelayed={isChatDelayed}
            isFollowing={isFollowing}
          />
        </>
      )}
      {variant === ChatVariant.COMMUNITY && (
        <ChatCommunity
          viewerName={viewerName}
          hostName={hostName}
          isHidden={isHidden}
        />
      )}
    </div>
  );
};

export const ChatSkeleton = () => {
  return (
    <div className="flex flex-col border-l border-b pt-0 h-[calc(100vh-80px)] border-2">
      <ChatHeaderSkeleton />
      <ChatListSkeleton />
      <ChatFormSkeleton />
    </div>
  );
};
