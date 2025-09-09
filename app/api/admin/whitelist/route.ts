import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    
    // TODO: Add admin role check here
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const applications = await db.whitelistApplication.findMany({
      include: {
        user: {
          select: {
            username: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      applications
    });

  } catch (error) {
    console.error("Error fetching whitelist applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}