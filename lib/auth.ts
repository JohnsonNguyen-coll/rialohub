import { PrismaAdapter } from "@next-auth/prisma-adapter"
import TwitterProvider from "next-auth/providers/twitter"
import DiscordProvider from "next-auth/providers/discord"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
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
            CredentialsProvider({
                  name: "Credentials",
                  credentials: {
                        username: { label: "Username", type: "text" },
                        password: { label: "Password", type: "password" }
                  },
                  async authorize(credentials) {
                        if (!credentials?.username || !credentials?.password) {
                              throw new Error("Missing username or password")
                        }

                        const user: any = await prisma.user.findUnique({
                              where: { username: credentials.username }
                        })

                        if (!user || !user.password) {
                              throw new Error("Invalid credentials")
                        }

                        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                        if (!isPasswordValid) {
                              throw new Error("Invalid credentials")
                        }

                        return {
                              id: user.id,
                              email: user.email,
                              name: user.name,
                              username: user.username,
                        }
                  }
            }),
      ],
      session: {
            strategy: "jwt",
      },
      callbacks: {
            async jwt({ token, account, profile }: any) {
                  if (account) {
                        token.accessToken = account.access_token
                        token.provider = account.provider
                        token.providerAccountId = account.providerAccountId
                        if (profile) {
                              // For Twitter v2, username is in profile.data.username
                              // For Discord, it's profile.username or profile.tag
                              token.username = profile.data?.username || profile.username || profile.name
                        }
                  }
                  return token
            },
            async session({ session, token }: any) {
                  if (session.user) {
                        (session as any).accessToken = token.accessToken
                              ; (session.user as any).provider = token.provider
                              ; (session.user as any).providerAccountId = token.providerAccountId
                              ; (session.user as any).username = token.username
                              ; (session.user as any).id = token.sub
                  }
                  return session
            },
      },
      events: {
            async signIn({ user, account, profile }: any) {
                  if (account && user.email) {
                        const data: any = {};
                        if (account.provider === 'twitter') {
                              data.twitterHandle = profile.data?.username || profile.username || profile.name;
                              data.twitterId = account.providerAccountId;
                        } else if (account.provider === 'discord') {
                              data.discordHandle = profile.username || profile.tag || profile.name;
                              data.discordId = account.providerAccountId;
                        }

                        if (Object.keys(data).length > 0) {
                              await prisma.user.update({
                                    where: { email: user.email },
                                    data
                              });
                        }
                  }
            },
      },
      secret: process.env.NEXTAUTH_SECRET,
      debug: true,
      pages: {
            signIn: '/',
      }
}
