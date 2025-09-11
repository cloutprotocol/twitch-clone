"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/theme-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ChatInfo } from "./chat-info";

interface ChatFormProps {
  onSubmit: () => void;
  value: string;
  onChange: (value: string) => void;
  isHidden: boolean;
  isFollowersOnly: boolean;
  isFollowing: boolean;
  isDelayed: boolean;
}

export const ChatForm = ({
  onSubmit,
  value,
  onChange,
  isHidden,
  isFollowersOnly,
  isFollowing,
  isDelayed,
}: ChatFormProps) => {
  const [isDelayBlocked, setIsDelayBlocked] = useState(false);

  const isFollowersOnlyAndNotFollowing = isFollowersOnly && !isFollowing;
  const isDisabled =
    isHidden || isDelayBlocked || isFollowersOnlyAndNotFollowing;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!value || isDisabled) return;

    if (isDelayed && !isDelayBlocked) {
      setIsDelayBlocked(true);
      setTimeout(() => {
        setIsDelayBlocked(false);
        onSubmit();
      }, 3000);
    } else {
      onSubmit();
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3"
    >
      <div className="w-full">
        <ChatInfo isDelayed={isDelayed} isFollowersOnly={isFollowersOnly} />
        <div className="relative">
          <Input
            onChange={(e) => onChange(e.target.value)}
            value={value}
            disabled={isDisabled}
            placeholder="Send a message"
            className={cn(
              "border-white/10 pr-12",
              (isFollowersOnly || isDelayed) && "rounded-t-none border-t-0"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!value || isDisabled) return;
                handleSubmit(e as any);
              }
            }}
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={isDisabled || !value.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-interactive-primary hover:bg-interactive-primary/80 disabled:bg-gray-500 disabled:opacity-50 rounded-md"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export const ChatFormSkeleton = () => {
  return (
    <div className="p-3">
      <div className="relative">
        <Skeleton className="w-full h-10" />
        <Skeleton className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md" />
      </div>
    </div>
  );
};
