import { redirect } from "next/navigation";
import { getSelf } from "@/lib/auth-service";
import { TokenLauncher } from "./_components/token-launcher";

interface LaunchPageProps {
  params: {
    username: string;
  };
}

const LaunchPage = async ({ params }: LaunchPageProps) => {
  const self = await getSelf();

  if (!self || self.username !== params.username) {
    redirect("/");
  }

  // Get the primary wallet for the user
  const primaryWallet = self.wallets.find(wallet => wallet.isPrimary) || self.wallets[0];

  return (
    <div className="h-full bg-background-primary text-text-inverse">
      <div className="max-w-4xl mx-auto h-full">
        <TokenLauncher userWallet={primaryWallet} />
      </div>
    </div>
  );
};

export default LaunchPage;