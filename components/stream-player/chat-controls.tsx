"use client";

import { useState, useTransition } from "react";
import { Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { onClearChat } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ChatControlsProps {
  streamId: string;
  isHost: boolean;
}

export const ChatControls = ({ streamId, isHost }: ChatControlsProps) => {
  const [isPending, startTransition] = useTransition();

  const onClear = () => {
    startTransition(() => {
      onClearChat(streamId)
        .then(() => {
          toast.success("Chat history cleared");
        })
        .catch(() => {
          toast.error("Failed to clear chat");
        });
    });
  };

  if (!isHost) {
    return null;
  }

  return (
    <div className="flex items-center gap-x-2 p-2 border-b">
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm font-medium">Chat Controls</span>
      <div className="ml-auto">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Chat History</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all chat messages for this stream.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onClear} disabled={isPending}>
                Clear Chat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};