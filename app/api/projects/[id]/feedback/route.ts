import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      try {
            const { id: projectId } = await params;

            const allFeedbacks = await (prisma.feedback as any).findMany({
                  where: { projectId: projectId },
                  include: {
                        user: { select: { username: true, name: true } as any }
                  },
                  orderBy: { createdAt: 'asc' }
            });

            // Helper to build tree recursively
            const buildTree = (parentId: string | null = null): any[] => {
                  return allFeedbacks
                        .filter((f: any) => f.parentId === parentId)
                        .map((f: any) => ({
                              ...f,
                              replies: buildTree(f.id)
                        }));
            };

            const tree = buildTree(null);

            // Sort top-level by newest first
            tree.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return NextResponse.json(tree);
      } catch (error: any) {
            console.error('Error fetching feedback:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}

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

            const user = await (prisma.user as any).findUnique({
                  where: { id: userId }
            });

            if (!user || (!user.username && !user.name)) {
                  return NextResponse.json({ error: 'Profile setup required' }, { status: 403 });
            }

            if (!user.twitterId || !user.discordId) {
                  return NextResponse.json({ error: 'X and Discord connection required' }, { status: 403 });
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

            // Create notification
            try {
                  const project = await (prisma.project as any).findUnique({ where: { id: projectId } });
                  if (project) {
                        if (parentId) {
                              const parentComment = await (prisma.feedback as any).findUnique({ where: { id: parentId } });
                              if (parentComment && parentComment.userId !== user.id) {
                                    await (prisma as any).notification.create({
                                          data: {
                                                userId: parentComment.userId,
                                                fromId: user.id,
                                                projectId: projectId,
                                                type: 'reply'
                                          }
                                    });
                              }
                        } else if (project.userId !== user.id) {
                              await (prisma as any).notification.create({
                                    data: {
                                          userId: project.userId,
                                          fromId: user.id,
                                          projectId: projectId,
                                          type: 'comment'
                                    }
                              });
                        }
                  }
            } catch (err) {
                  console.error('Notification creation error:', err);
            }

            return NextResponse.json(feedback);
      } catch (error: any) {
            console.error('Error posting feedback:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}
