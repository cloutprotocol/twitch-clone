import Link from "next/link";
import { Clapperboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentSession } from "@/lib/auth-service";
import { SignInButton } from "@/components/auth/sign-in-button";
import { UserDropdown } from "@/components/auth/user-dropdown";

export const Actions = async () => {
  const session = await getCurrentSession();
  const user = session?.user;

  return (
    <div className="flex items-center justify-end gap-x-2 ml-4 lg:ml-0">
      {!user && (
        <SignInButton size="sm" />
      )}
      {!!user && (
        <div className="flex items-center gap-x-4">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-primary"
            asChild
          >
            <Link href={`/u/${user.username}`}>
              <Clapperboard className="h-5 w-5 lg:mr-2" />
              <span className="hidden lg:block">Dashboard</span>
            </Link>
          </Button>
          
          <UserDropdown user={user} />
        </div>
      )}
    </div>
  );
};
