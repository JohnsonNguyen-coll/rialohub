import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id: projectId } = await params;
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;

      if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
            where: { id: userId }
      });

      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // Check if already voted
      const existingVote = await prisma.vote.findUnique({
            where: {
                  userId_projectId: {
                        userId: user.id,
                        projectId: projectId
                  }
            }
      });

      if (existingVote) {
            // Toggle vote: Remove if exists
            await prisma.vote.delete({
                  where: { id: existingVote.id }
            });
            return NextResponse.json({ voted: false });
      } else {
            // Add vote
            await prisma.vote.create({
                  data: {
                        userId: user.id,
                        projectId: projectId
                  }
            });
            return NextResponse.json({ voted: true });
      }
}
