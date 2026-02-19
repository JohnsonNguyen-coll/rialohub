import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id } = await params;

      try {
            const project = await prisma.project.findUnique({
                  where: { id },
                  include: {
                        user: {
                              select: {
                                    id: true,
                                    username: true,
                                    image: true,
                                    twitterHandle: true,
                                    discordHandle: true,
                              }
                        },
                        _count: {
                              select: {
                                    votes: true,
                                    feedback: true,
                              }
                        }
                  }
            });

            if (!project) {
                  return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            return NextResponse.json(project);
      } catch (error) {
            console.error('Error fetching project:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}

export async function DELETE(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id } = await params;

      try {
            await prisma.vote.deleteMany({ where: { projectId: id } });
            await prisma.feedback.deleteMany({ where: { projectId: id } });

            await prisma.project.delete({
                  where: { id }
            });

            return NextResponse.json({ message: 'Project deleted successfully' });
      } catch (error) {
            console.error('Error deleting project:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}

export async function PUT(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id } = await params;

      try {
            const body = await req.json();
            const { name, description, link, category, isPinned, isEvent, deadline, recap } = body;

            // In a real app, check session to verify ownership
            /*
            const session = await getServerSession(authOptions);
            const project = await prisma.project.findUnique({ where: { id } });
            if (!project || (project.userId !== session.user.id && session.user.role !== 'admin')) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            */

            const updatedProject = await prisma.project.update({
                  where: { id },
                  data: {
                        name,
                        description,
                        link: link || '#',
                        category,
                        isPinned: isPinned ?? undefined,
                        isEvent: isEvent ?? undefined,
                        deadline: deadline ? new Date(deadline) : undefined,
                        recap: recap ?? undefined,
                  }
            });

            return NextResponse.json(updatedProject);
      } catch (error) {
            console.error('Error updating project:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}

