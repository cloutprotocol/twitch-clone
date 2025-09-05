"use server";

import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const updateUser = async (values: Partial<User>) => {
  const self = await getSelf();

  const validData = {
    bio: values.bio,
    twitterUrl: values.twitterUrl,
    instagramUrl: values.instagramUrl,
    tiktokUrl: values.tiktokUrl,
    discordUrl: values.discordUrl,
    telegramUrl: values.telegramUrl,
    twitchUrl: values.twitchUrl,
    websiteUrl: values.websiteUrl,
  };

  const user = await db.user.update({
    where: { id: self.id },
    data: { ...validData },
  });

  revalidatePath(`/${self.username}`);
  revalidatePath(`/u/${self.username}`);

  return user;
};
