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
