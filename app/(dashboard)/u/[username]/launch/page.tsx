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

  return (
    <div className="min-h-screen bg-[#0e0e10] text-white">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Launch Token</h1>
          <p className="text-gray-400">
            Create and launch Solana tokens with optional fee sharing capabilities.
          </p>
        </div>
        
        <TokenLauncher />
      </div>
    </div>
  );
};

export default LaunchPage;