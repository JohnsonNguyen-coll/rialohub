import { PrismaAdapter } from "@next-auth/prisma-adapter"
import TwitterProvider from "next-auth/providers/twitter"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "@/lib/db"
import { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
      adapter: PrismaAdapter(prisma),
      providers: [
            TwitterProvider({
                  clientId: process.env.TWITTER_CLIENT_ID || "",
                  clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
                  version: "2.0",
            }),
            DiscordProvider({
                  clientId: process.env.DISCORD_CLIENT_ID || "",
                  clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
            }),
      ],
      callbacks: {
            async jwt({ token, account, profile }: any) {
                  if (account) {
                        token.accessToken = account.access_token
                        token.provider = account.provider
                        if (profile) {
                              token.username = profile.data?.username || profile.username
                        }
                  }
                  return token
            },
            async session({ session, token }: any) {
                  if (session.user) {
                        (session as any).accessToken = token.accessToken
                        session.user.provider = token.provider
                        session.user.username = token.username
                  }
                  return session
            },
      },
      secret: process.env.NEXTAUTH_SECRET,
      debug: true,
      pages: {
            signIn: '/',
      }
}
