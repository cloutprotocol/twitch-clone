import Link from "next/link";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth-service";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { TwitchStyleThemeToggle } from "@/components/theme/twitch-style-toggle";

export const Actions = async () => {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      <TwitchStyleThemeToggle />
      
      {!user && (
        <SignInButton size="sm" />
      )}
      {!!user && (
        <div className="flex items-center gap-x-4">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            asChild
          >
            <Link href={`/u/${user.username}/launch`}>
              <Rocket className="h-4 w-4 lg:mr-2" />
              <span className="hidden lg:block">Launch</span>
            </Link>
          </Button>
          
          <UserDropdown user={user} />
        </div>
      )}
    </div>
  );
};
