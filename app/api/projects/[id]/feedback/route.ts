import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id: projectId } = await params;

      const feedbacks = await (prisma.feedback as any).findMany({
            where: {
                  projectId: projectId,
                  parentId: null
            },
            include: {
                  user: {
                        select: { username: true }
                  },
                  replies: {
                        include: {
                              user: {
                                    select: { username: true }
                              }
                        },
                        orderBy: { createdAt: 'asc' }
                  }
            },
            orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json(feedbacks);
}

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

      if (!user || (!user.username && !user.name)) {
            return NextResponse.json({ error: 'Profile setup required' }, { status: 403 });
      }

      const { content, parentId } = await req.json();

      const feedback = await (prisma.feedback as any).create({
            data: {
                  content,
                  userId: user.id,
                  projectId: projectId,
                  parentId: parentId || null
            }
      });

      return NextResponse.json(feedback);
}
