"use client";

import moment from "moment"
import { ReceivedChatMessage } from "@livekit/components-react";

import { stringToColor } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

interface ChatMessageProps {
  data: ReceivedChatMessage;
}

export const ChatMessage = ({ data }: ChatMessageProps) => {
  const color = stringToColor(data.from?.name || "");

  return (
    <div className="flex gap-2 p-2 rounded-md hover:bg-white/5">
      <UserAvatar
        username={data.from?.name || "Anonymous"}
        imageUrl=""
        size="default"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <p className="text-sm font-semibold whitespace-nowrap">
            <span className="truncate" style={{ color: color }}>
              {data.from?.name}
            </span>
          </p>
          <p className="text-xs text-text-inverse/40">{moment(data.timestamp).format("HH:mm")}</p>
        </div>
        <p className="text-sm break-words">{data.message}</p>
      </div>
    </div>
  );
};
