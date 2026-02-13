import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/db"

export const authOptions = {
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
                  session.accessToken = token.accessToken
                  session.user.provider = token.provider
                  session.user.username = token.username
                  return session
            },
      },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
