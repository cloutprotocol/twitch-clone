"use server";

import {
  IngressAudioEncodingPreset,
  IngressInput,
  IngressClient,
  IngressVideoEncodingPreset,
  RoomServiceClient,
  type CreateIngressOptions,
} from "livekit-server-sdk";

import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_API_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL!);

export const resetIngresses = async (hostIdentity: string) => {
  try {
    console.log("🔄 Listing existing ingresses for:", hostIdentity);
    const ingresses = await ingressClient.listIngress({
      roomName: hostIdentity,
    });

    console.log("🔄 Listing existing rooms for:", hostIdentity);
    const rooms = await roomService.listRooms([hostIdentity]);

    console.log(`🗑️ Deleting ${rooms.length} rooms...`);
    for (const room of rooms) {
      try {
        await roomService.deleteRoom(room.name);
        console.log(`✅ Deleted room: ${room.name}`);
      } catch (error) {
        console.warn(`⚠️ Failed to delete room ${room.name}:`, error);
        // Continue with other rooms
      }
    }

    console.log(`🗑️ Deleting ${ingresses.length} ingresses...`);
    for (const ingress of ingresses) {
      if (ingress.ingressId) {
        try {
          await ingressClient.deleteIngress(ingress.ingressId);
          console.log(`✅ Deleted ingress: ${ingress.ingressId}`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete ingress ${ingress.ingressId}:`, error);
          // Continue with other ingresses
        }
      }
    }
    
    console.log("✅ Reset ingresses completed");
  } catch (error) {
    console.error("❌ Error in resetIngresses:", error);
    // Don't throw here - we want to continue with creating new ingress
    console.warn("⚠️ Continuing despite reset errors...");
  }
};

export const createIngress = async (ingressType: IngressInput) => {
  try {
    console.log("🚀 Starting ingress creation for type:", ingressType);
    
    // Validate environment variables
    if (!process.env.LIVEKIT_API_URL || !process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      console.error("❌ Missing LiveKit environment variables");
      throw new Error("LiveKit configuration is missing");
    }

    const self = await getSelf();
    console.log("✅ User authenticated:", self.username);

    // Check if user has a stream
    const existingStream = await db.stream.findUnique({
      where: { userId: self.id },
    });

    if (!existingStream) {
      console.error("❌ No stream found for user:", self.id);
      throw new Error("Stream not found for user");
    }

    console.log("🔄 Resetting existing ingresses...");
    await resetIngresses(self.id);

    const options: CreateIngressOptions = {
      name: self.username,
      roomName: self.id,
      participantName: self.username,
      participantIdentity: self.id,
    };

    if (ingressType === IngressInput.WHIP_INPUT) {
      options.bypassTranscoding = true;
    } else {
      options.video = {
        source: TrackSource.CAMERA,
        preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
      };
      options.audio = {
        source: TrackSource.MICROPHONE,
        preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
      };
    }

    console.log("🔄 Creating ingress with LiveKit...");
    const ingress = await ingressClient.createIngress(ingressType, options);

    if (!ingress || !ingress.url || !ingress.streamKey) {
      console.error("❌ Invalid ingress response:", ingress);
      throw new Error("Failed to create ingress - invalid response from LiveKit");
    }

    console.log("✅ Ingress created successfully:", ingress.ingressId);

    console.log("🔄 Updating database...");
    await db.stream.update({
      where: { userId: self.id },
      data: {
        ingressId: ingress.ingressId,
        serverUrl: ingress.url,
        streamKey: ingress.streamKey,
      },
    });

    console.log("✅ Database updated successfully");
    revalidatePath(`/u/${self.username}/keys`);
    
    return ingress;
  } catch (error) {
    console.error("❌ Error in createIngress:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("LiveKit")) {
        throw new Error("LiveKit service error. Please check your streaming configuration.");
      }
      if (error.message.includes("Stream not found")) {
        throw new Error("User stream not found. Please contact support.");
      }
      if (error.message.includes("Unauthorized")) {
        throw new Error("Authentication failed. Please sign in again.");
      }
    }
    
    throw new Error("Failed to generate streaming keys. Please try again.");
  }
};
