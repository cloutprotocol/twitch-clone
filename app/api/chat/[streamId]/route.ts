import { NextRequest, NextResponse } from "next/server";
import { getChatMessages } from "@/lib/chat-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const messages = await getChatMessages(params.streamId);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json([], { status: 500 });
  }
}