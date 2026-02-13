import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const { username, twitterHandle, discordHandle } = await req.json();

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
                        email: session.user.email
                  }
            }
      });

      if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                  username,
                  twitterHandle,
                  discordHandle,
            }
      });

      return NextResponse.json(updatedUser);
}

export async function GET(req: NextRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                  projects: true
            }
      });

      return NextResponse.json(user);
}
