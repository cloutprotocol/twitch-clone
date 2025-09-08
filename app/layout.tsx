import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { WalletContextProvider } from "@/components/auth/wallet-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "rarecube.tv",
  description: "rarecube.tv is a cutting-edge streaming platform for creators and communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <WalletContextProvider>
            <ThemeProvider
              defaultTheme="dark"
              storageKey="rarecube-theme"
            >
              <Toaster theme="light" position="top-right" />
              {children}
            </ThemeProvider>
          </WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
