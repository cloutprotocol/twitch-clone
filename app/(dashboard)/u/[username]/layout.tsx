import { redirect } from "next/navigation";

import { getSelfByUsername } from "@/lib/auth-service";

import { Sidebar } from "./_components/sidebar";
import { Container } from "./_components/container";
import { MobileOverlay } from "./_components/mobile-overlay";
import { FloatingWallet } from "@/components/layout/floating-wallet";

interface CreatorLayoutProps {
  params: { username: string };
  children: React.ReactNode;
}

const CreatorLayout = async ({ params, children }: CreatorLayoutProps) => {
  const self = await getSelfByUsername(params.username);

  if (!self) {
    redirect("/");
  }

  return (
    <>
      <div className="flex h-full">
        <Sidebar />
        <Container>{children}</Container>
        <FloatingWallet />
        <MobileOverlay />
      </div>
    </>
  );
};

export default CreatorLayout;
