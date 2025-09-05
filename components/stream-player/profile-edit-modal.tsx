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
import { updateStream } from "@/actions/stream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ProfileEditModalProps {
  initialValues: {
    bio?: string;
    streamTitle?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    discordUrl?: string;
    telegramUrl?: string;
    twitchUrl?: string;
    websiteUrl?: string;
  };
  trigger?: React.ReactNode;
}

export const ProfileEditModal = ({ initialValues, trigger }: ProfileEditModalProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);

  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState({
    bio: initialValues.bio || "",
    streamTitle: initialValues.streamTitle || "",
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

    startTransition(async () => {
      try {
        // Update user profile (bio and social links)
        const userValues = {
          bio: values.bio,
          twitterUrl: values.twitterUrl,
          instagramUrl: values.instagramUrl,
          tiktokUrl: values.tiktokUrl,
          discordUrl: values.discordUrl,
          telegramUrl: values.telegramUrl,
          twitchUrl: values.twitchUrl,
          websiteUrl: values.websiteUrl,
        };
        await updateUser(userValues);

        // Update stream title if provided
        if (values.streamTitle.trim()) {
          await updateStream({ title: values.streamTitle });
        }

        toast.success("Profile updated successfully");
        closeRef.current?.click();
      } catch (error) {
        toast.error("Something went wrong");
      }
    });
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      Edit Profile
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Stream Title Section */}
          <div className="space-y-3">
            <Label htmlFor="streamTitle" className="text-sm font-medium">
              Stream Title
            </Label>
            <Input
              id="streamTitle"
              placeholder="Enter your stream title..."
              value={values.streamTitle}
              onChange={(e) => handleInputChange("streamTitle", e.target.value)}
              disabled={isPending}
            />
          </div>

          <Separator />

          {/* Bio Section */}
          <div className="space-y-3">
            <Label htmlFor="bio" className="text-sm font-medium">
              About
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell your viewers about yourself..."
              value={values.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              disabled={isPending}
              className="resize-none min-h-[80px]"
              rows={3}
            />
          </div>

          <Separator />

          {/* Social Links Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Social Links</Label>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="twitterUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="instagramUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="tiktokUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="discordUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="telegramUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="twitchUrl" className="text-xs text-muted-foreground">
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
                <Label htmlFor="websiteUrl" className="text-xs text-muted-foreground">
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
          </div>

          <div className="flex justify-between pt-4">
            <DialogClose ref={closeRef} asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={isPending} type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};