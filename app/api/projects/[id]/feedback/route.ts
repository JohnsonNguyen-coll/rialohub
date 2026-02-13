import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      const { id: projectId } = await params;

      const feedbacks = await prisma.feedback.findMany({
            where: { projectId: projectId },
            include: {
                  user: {
                        select: { username: true }
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

      if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
            where: { email: session.user.email }
      });

      if (!user || !user.username) {
            return NextResponse.json({ error: 'Profile setup required' }, { status: 403 });
      }

      const { content } = await req.json();

      const feedback = await prisma.feedback.create({
            data: {
                  content,
                  userId: user.id,
                  projectId: projectId
            }
      });

      return NextResponse.json(feedback);
}
