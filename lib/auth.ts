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
                  authorization: {
                        params: { scope: "users.read tweet.read offline.access" },
                  },
            }),
            DiscordProvider({
                  clientId: process.env.DISCORD_CLIENT_ID || "",
                  clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
                  authorization: { params: { scope: "identify" } },
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
                              username: user.username,
                              role: user.role,
                        }
                  }
            }),
      ],
      session: {
            strategy: "jwt",
      },
      callbacks: {
            async signIn({ user, account, profile }: any) {
                  // Allow all sign-ins
                  return true;
            },
            async jwt({ token, user, account }: any) {
                  if (user) {
                        token.id = user.id;
                        token.username = user.username;
                        token.role = user.role;
                  }

                  if (token.sub) {
                        const dbUser: any = await prisma.user.findUnique({
                              where: { id: token.sub },
                              select: { role: true, username: true, twitterId: true, discordId: true, twitterHandle: true, discordHandle: true } as any
                        });
                        if (dbUser) {
                              token.role = dbUser.role;
                              token.username = dbUser.username;
                              token.twitterId = dbUser.twitterId;
                              token.discordId = dbUser.discordId;
                              token.twitterHandle = dbUser.twitterHandle;
                              token.discordHandle = dbUser.discordHandle;
                        }
                  }
                  return token
            },
            async session({ session, token }: any) {
                  if (session.user) {
                        session.user.id = token.sub;
                        session.user.username = token.username;
                        session.user.role = token.role;
                        session.user.twitterId = token.twitterId;
                        session.user.discordId = token.discordId;
                        session.user.twitterHandle = token.twitterHandle;
                        session.user.discordHandle = token.discordHandle;
                  }
                  return session
            },
      },
      events: {
            async signIn({ user, account, profile }: any) {
                  // This is the "Linking" logic
                  if (account && user.id && account.provider !== 'credentials') {
                        const data: any = {};
                        if (account.provider === 'twitter') {
                              // For Twitter v2, handle is in data.username
                              data.twitterHandle = profile.data?.username || profile.username || profile.name;
                              data.twitterId = account.providerAccountId;
                        } else if (account.provider === 'discord') {
                              data.discordHandle = profile.username || profile.tag || profile.name;
                              data.discordId = account.providerAccountId;
                        }

                        if (Object.keys(data).length > 0) {
                              await prisma.user.update({
                                    where: { id: user.id },
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
