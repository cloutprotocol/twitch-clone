import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    username: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Don't use adapter with credentials provider - it conflicts
  // adapter: PrismaAdapter(db) as any,
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      id: "wallet",
      name: "Wallet",
      credentials: {
        address: { label: "Wallet Address", type: "text" },
      },
      async authorize(credentials) {
        console.log("=== WALLET AUTH DEBUG ===");
        console.log("Environment:", process.env.NODE_ENV);
        console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
        console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
        console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
        console.log("Wallet address:", credentials?.address);
        console.log("========================");

        if (!credentials?.address) {
          console.error("Missing wallet address");
          return null;
        }

        try {
          // Test database connection first
          await db.$connect();
          
          // Find or create user with this wallet address - no signature verification needed
          let wallet = await db.wallet.findUnique({
            where: { address: credentials.address },
            include: { user: true },
          });

          let user;
          
          if (wallet) {
            // Update last verified time
            await db.wallet.update({
              where: { address: credentials.address },
              data: { lastVerified: new Date() },
            });
            user = wallet.user;
          } else {
            // Create new user with wallet - simple approach like pump.fun
            const username = `${credentials.address.slice(0, 4)}...${credentials.address.slice(-4)}`;
            
            user = await db.user.create({
              data: {
                username,
                imageUrl: "",
                accounts: {
                  create: {
                    type: "wallet",
                    provider: "solana",
                    providerAccountId: credentials.address,
                  },
                },
                wallets: {
                  create: {
                    chain: "solana",
                    address: credentials.address,
                    isPrimary: true,
                    lastVerified: new Date(),
                  },
                },
                stream: {
                  create: {
                    title: `${username}'s stream`,
                    ingressId: `wallet_${credentials.address}_${Date.now()}`,
                  },
                },
              },
            });
          }

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            image: user.imageUrl,
          };
        } catch (error) {
          console.error("Wallet authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.image = user.image;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.username = token.username;
        session.user.image = token.image as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};