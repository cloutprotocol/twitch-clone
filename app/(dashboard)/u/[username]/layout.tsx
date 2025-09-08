import { redirect } from "next/navigation";

import { getSelfByUsername } from "@/lib/auth-service";

import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { Container } from "./_components/container";
import { MobileOverlay } from "./_components/mobile-overlay";

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
        <div className="fixed top-0 right-0 z-50">
          <Navbar />
        </div>
        <MobileOverlay />
      </div>
    </>
  );
};

export default CreatorLayout;
