import { NextResponse } from "next/server";
import { syncViewerCounts } from "@/lib/livekit-sync";

export async function POST() {
  try {
    await syncViewerCounts();
    return NextResponse.json({ success: true, message: "Viewer counts synced" });
  } catch (error) {
    console.error("Error syncing viewer counts:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    await syncViewerCounts();
    return NextResponse.json({ success: true, message: "Viewer counts synced" });
  } catch (error) {
    console.error("Error syncing viewer counts:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}