import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      try {
            const { id: projectId } = await params;
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            if (!userId) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Connection Check
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user?.twitterId || !user?.discordId) {
                  return NextResponse.json({ error: 'X and Discord connection required' }, { status: 403 });
            }

            const existingVote = await (prisma.vote as any).findUnique({
                  where: {
                        userId_projectId: {
                              userId: userId,
                              projectId: projectId
                        }
                  }
            });

            if (existingVote) {
                  try {
                        await (prisma.vote as any).delete({
                              where: { id: existingVote.id }
                        });
                        return NextResponse.json({ voted: false });
                  } catch (e: any) {
                        if (e.code === 'P2025') return NextResponse.json({ voted: false });
                        throw e;
                  }
            } else {
                  try {
                        await (prisma.vote as any).create({
                              data: {
                                    userId: userId,
                                    projectId: projectId
                              }
                        });

                        try {
                              const project = await (prisma.project as any).findUnique({ where: { id: projectId } });
                              if (project && project.userId !== userId) {
                                    await (prisma as any).notification.create({
                                          data: {
                                                userId: project.userId,
                                                fromId: userId,
                                                projectId: projectId,
                                                type: 'vote'
                                          }
                                    });
                              }
                        } catch (err) {
                              console.error('Notification error:', err);
                        }

                        return NextResponse.json({ voted: true });
                  } catch (e: any) {
                        if (e.code === 'P2002') return NextResponse.json({ voted: true });
                        throw e;
                  }
            }
      } catch (error: any) {
            if (error.code === 'P2002') return NextResponse.json({ voted: true });
            console.error('Voting server error:', error);
            return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
      }
}
