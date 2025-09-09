import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { WalletContextProvider } from "@/components/auth/wallet-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "rarecube.tv",
  description: "open sourced streaming for creator capitol markets.",
  openGraph: {
    title: "rarecube.tv",
    description: "open sourced streaming for creator capitol markets.",
    siteName: "rarecube.tv",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "rarecube.tv",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "rarecube.tv",
    description: "open sourced streaming for creator capitol markets.",
    images: ["/og-image.png"],
  },
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
              {children}
            </ThemeProvider>
          </WalletContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
