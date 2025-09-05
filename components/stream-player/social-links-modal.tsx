"use client";

import { toast } from "sonner";
import { useState, useTransition, useRef, ElementRef } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateUser } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SocialLinksModalProps {
  initialValues: {
    twitterUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    discordUrl?: string;
    telegramUrl?: string;
    twitchUrl?: string;
    websiteUrl?: string;
  };
}

export const SocialLinksModal = ({ initialValues }: SocialLinksModalProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);

  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    twitterUrl: initialValues.twitterUrl || "",
    instagramUrl: initialValues.instagramUrl || "",
    tiktokUrl: initialValues.tiktokUrl || "",
    discordUrl: initialValues.discordUrl || "",
    telegramUrl: initialValues.telegramUrl || "",
    twitchUrl: initialValues.twitchUrl || "",
    websiteUrl: initialValues.websiteUrl || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(() => {
      updateUser(values)
        .then(() => {
          toast.success("Social links updated");
          closeRef.current?.click();
        })
        .catch(() => toast.error("Something went wrong"));
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="ml-auto">
          Edit Links
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit social links</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="twitterUrl" className="text-sm font-medium">
                X (Twitter)
              </Label>
              <Input
                id="twitterUrl"
                placeholder="https://x.com/username"
                value={values.twitterUrl}
                onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instagramUrl" className="text-sm font-medium">
                Instagram
              </Label>
              <Input
                id="instagramUrl"
                placeholder="https://instagram.com/username"
                value={values.instagramUrl}
                onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tiktokUrl" className="text-sm font-medium">
                TikTok
              </Label>
              <Input
                id="tiktokUrl"
                placeholder="https://tiktok.com/@username"
                value={values.tiktokUrl}
                onChange={(e) => handleInputChange("tiktokUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="discordUrl" className="text-sm font-medium">
                Discord
              </Label>
              <Input
                id="discordUrl"
                placeholder="https://discord.gg/server"
                value={values.discordUrl}
                onChange={(e) => handleInputChange("discordUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="telegramUrl" className="text-sm font-medium">
                Telegram
              </Label>
              <Input
                id="telegramUrl"
                placeholder="https://t.me/username"
                value={values.telegramUrl}
                onChange={(e) => handleInputChange("telegramUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="twitchUrl" className="text-sm font-medium">
                Twitch
              </Label>
              <Input
                id="twitchUrl"
                placeholder="https://twitch.tv/username"
                value={values.twitchUrl}
                onChange={(e) => handleInputChange("twitchUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="websiteUrl" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="websiteUrl"
                placeholder="https://your-website.com"
                value={values.websiteUrl}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                disabled={isPending}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <DialogClose ref={closeRef} asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending} type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};