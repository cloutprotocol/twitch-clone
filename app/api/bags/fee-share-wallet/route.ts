import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSelf();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const { bagsSDK } = await import("@/lib/bags-sdk");

    const wallet = await bagsSDK.getFeeShareWallet(username);

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Fee share wallet lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup fee share wallet" },
      { status: 500 }
    );
  }
}