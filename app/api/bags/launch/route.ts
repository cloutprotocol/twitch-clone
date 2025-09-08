import { NextRequest, NextResponse } from "next/server";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getSelf();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const symbol = formData.get("symbol") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;
    const launchType = formData.get("launchType") as string;
    const socialUsername = formData.get("twitterUsername") as string;
    const creatorFeeBps = parseInt(formData.get("creatorFeeBps") as string) || 1000;
    const feeClaimerFeeBps = parseInt(formData.get("feeClaimerFeeBps") as string) || 9000;
    const initialBuySOL = parseFloat(formData.get("initialBuySOL") as string) || 0.01;
    const websiteLink = formData.get("websiteLink") as string;
    const twitterLink = formData.get("twitterLink") as string;
    const telegramLink = formData.get("telegramLink") as string;
    const privateKey = formData.get("privateKey") as string;

    // Validate required fields
    if (!name || !symbol || !description || !privateKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { bagsSDK } = await import("@/lib/bags-sdk");

    // Convert image to URL if provided
    let imageUrl = "";
    if (image) {
      // For now, we'll need to handle image upload separately
      // You might want to use your existing UploadThing setup
      imageUrl = ""; // TODO: Implement image upload
    }

    let result;

    if (launchType === "twitter-fee-sharing" && socialUsername) {
      result = await bagsSDK.launchTokenWithSharedFees({
        imageUrl,
        name,
        symbol,
        description,
        feeClaimerTwitterHandle: socialUsername,
        creatorFeeBps,
        feeClaimerFeeBps,
        initialBuySOL,
        telegram: telegramLink,
        twitter: twitterLink,
        website: websiteLink,
        privateKey,
      });
    } else {
      result = await bagsSDK.launchTokenStandard({
        imageUrl,
        name,
        symbol,
        description,
        telegram: telegramLink,
        twitter: twitterLink,
        website: websiteLink,
        initialBuySOL,
        privateKey,
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Token launch error:", error);
    return NextResponse.json(
      { error: "Failed to launch token" },
      { status: 500 }
    );
  }
}