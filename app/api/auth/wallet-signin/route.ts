import { NextRequest } from "next/server";
import { signIn } from "next-auth/react";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return new Response("Wallet address is required", { status: 400 });
    }

    // Find or create user with this wallet address
    let wallet = await db.wallet.findUnique({
      where: { address },
      include: { user: true },
    });

    let user;
    
    if (wallet) {
      // Update last verified time
      await db.wallet.update({
        where: { address },
        data: { lastVerified: new Date() },
      });
      user = wallet.user;
    } else {
      // Create new user with wallet - no message signing required
      const username = `${address.slice(0, 4)}...${address.slice(-4)}`;
      
      user = await db.user.create({
        data: {
          username,
          imageUrl: "",
          accounts: {
            create: {
              type: "wallet",
              provider: "solana",
              providerAccountId: address,
            },
          },
          wallets: {
            create: {
              chain: "solana",
              address: address,
              isPrimary: true,
              lastVerified: new Date(),
            },
          },
          stream: {
            create: {
              title: `${username}'s stream`,
            },
          },
        },
      });
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        address,
      },
    });
  } catch (error) {
    console.error("Wallet sign-in error:", error);
    return new Response("Authentication failed", { status: 500 });
  }
}