import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

import { db } from "@/lib/db";
import { resetIngresses } from "@/actions/ingress";

export async function POST(req: Request) {
  
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");


  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  // Get the type
  const eventType = evt.type;

  if (eventType === "user.created") {
    
    // Add the user to the database - fixed to handle unique email constraint
    const email = payload.data.email_addresses?.[0]?.email_address || 
                 payload.data.primary_email_address?.email_address || 
                 `${payload.data.id}@noemail.local`; // Use unique placeholder email
    const username = payload.data.username || "user_" + payload.data.id.slice(-6);
    
    try {
      // Create user first, then stream separately to avoid ingressId constraint issues
      const newUser = await db.user.create({
        data: {
          externalUserId: payload.data.id,
          email: email,
          username: username,
          imageUrl: payload.data.image_url || "",
        },
      });
      
      // Create stream with a unique ingressId placeholder to avoid constraint issues
      await db.stream.create({
        data: {
          title: `${username}'s stream`,
          userId: newUser.id,
          ingressId: `temp_${payload.data.id}`, // Temporary unique ingressId
        },
      });
      
      console.log("User and stream created successfully!");
    } catch (error) {
      console.error("Error creating user:", error);
      return new Response("Error creating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    await db.user.update({
      where: {
        externalUserId: payload.data.id,
      },
      data: {
        username: payload.data.username,
        imageUrl: payload.data.image_url,
      },
    });
  }

  if (eventType === "user.deleted") {
    await resetIngresses(payload.data.id);

    await db.user.delete({
      where: {
        externalUserId: payload.data.id,
      },
    });
  }

  return new Response("", { status: 200 });
}
