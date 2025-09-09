import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const self = await getSelf();
    const formData = await req.formData();
    
    const file = formData.get('file') as File;
    const streamId = formData.get('streamId') as string;
    
    if (!file || !streamId) {
      return new NextResponse("Missing file or streamId", { status: 400 });
    }

    // Verify user owns the stream
    const stream = await db.stream.findUnique({
      where: { 
        id: streamId,
        userId: self.id 
      }
    });

    if (!stream) {
      return new NextResponse("Stream not found or unauthorized", { status: 404 });
    }

    // Convert file to buffer for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For now, save to local filesystem (you can integrate with UploadThing/S3 later)
    const filename = `thumbnail-${streamId}-${Date.now()}.jpg`;
    const filepath = `/tmp/thumbnails/${filename}`;
    
    // Ensure directory exists
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const dir = path.dirname(filepath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(filepath, new Uint8Array(buffer));
    
    // For local development, serve from a public endpoint
    const publicUrl = `/api/serve-thumbnail/${streamId}/${filename}`;
    
    // Update database
    await db.stream.update({
      where: { id: streamId },
      data: { 
        thumbnail: publicUrl,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename 
    });
    
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
}