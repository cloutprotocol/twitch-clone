"use client";

import { useEffect, useState, useTransition } from "react";
import { useMediaQuery } from "usehooks-ts";
import { toast } from "sonner";

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

interface DatabaseChatProps {
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

export const DatabaseChat = ({
  hostName,
  hostIdentity,
  viewerName,
  isFollowing,
  isChatEnabled,
  isChatDelayed,
  isChatFollowersOnly,
  streamId,
  initialMessages = [],
}: DatabaseChatProps) => {
  const matches = useMediaQuery("(max-width: 1024px)");
  const { variant, onExpand } = useChatSidebar((state) => state);
  const [isPending, startTransition] = useTransition();

  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  useEffect(() => {
    if (matches) {
      onExpand();
    }
  }, [matches, onExpand]);

  // Convert to LiveKit format for existing ChatList component
  const displayMessages = messages.map((msg) => ({
    message: msg.content,
    from: {
      identity: msg.userId || `guest-${msg.username}`,
      name: msg.username,
    },
    timestamp: msg.createdAt.getTime(),
    id: msg.id,
  })).sort((a, b) => b.timestamp - a.timestamp);

  // Poll for new messages every 2 seconds
  useEffect(() => {
    if (!isChatEnabled) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/chat/${streamId}`);
        if (response.ok) {
          const newMessages = await response.json();
          setMessages(newMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [streamId, isChatEnabled]);

  const onSubmit = () => {
    if (!value.trim() || isPending) return;

    startTransition(async () => {
      try {
        const newMessage = await onSendMessage(streamId, value, viewerName);
        setMessages(prev => [...prev, {
          ...newMessage,
          userId: newMessage.userId ?? undefined,
          user: newMessage.user ?? undefined
        }]);
        setValue("");
        toast.success("Message sent!");
      } catch (error) {
        toast.error("Failed to send message");
      }
    });
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  const isHidden = !isChatEnabled;

  return (
    <div className="flex flex-col bg-background border-l border-b pt-0 h-[calc(100vh-80px)]">
      <ChatHeader />
      {variant === ChatVariant.CHAT && (
        <>
          <ChatList messages={displayMessages as any} isHidden={isHidden} />
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