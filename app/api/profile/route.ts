import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;

      if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { username, twitterHandle, twitterId, discordHandle, discordId } = await req.json();

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
            return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
      }

      // Check if username already exists for another user
      const existingUser = await prisma.user.findFirst({
            where: {
                  username: username,
                  NOT: {
                        id: userId
                  }
            }
      });

      if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }

      // Check if Twitter account already linked to another user
      if (twitterId) {
            const existingTwitterUser = await prisma.user.findFirst({
                  where: {
                        twitterId: twitterId,
                        NOT: {
                              id: userId
                        }
                  }
            });
            if (existingTwitterUser) {
                  return NextResponse.json({ error: 'This Twitter account is already linked to another profile' }, { status: 400 });
            }
      }

      // Check if Discord account already linked to another user
      if (discordId) {
            const existingDiscordUser = await prisma.user.findFirst({
                  where: {
                        discordId: discordId,
                        NOT: {
                              id: userId
                        }
                  }
            });
            if (existingDiscordUser) {
                  return NextResponse.json({ error: 'This Discord account is already linked to another profile' }, { status: 400 });
            }
      }

      const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                  username,
                  twitterHandle,
                  twitterId,
                  discordHandle,
                  discordId,
            }
      });

      return NextResponse.json(updatedUser);
}

export async function GET(req: NextRequest) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;

      if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                  projects: true
            }
      });

      return NextResponse.json(user);
}
