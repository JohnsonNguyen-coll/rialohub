import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');
      const userId = searchParams.get('userId');
      const eventId = searchParams.get('eventId');
      const isTop = searchParams.get('isTop');

      const projects = await (prisma.project as any).findMany({
            where: {
                  ...(category ? { category } : {}),
                  ...(userId ? { userId } : {}),
                  ...(isTop === 'true' ? { isTop: true } : {}),
                  ...(!userId && !isTop ? { eventId: eventId || null } : {}),
            },
            include: {
                  user: true,
                  _count: {
                        select: { votes: true, feedback: true }
                  }
            },
            orderBy: [
                  { isPinned: 'desc' },
                  { isEvent: 'desc' },
                  {
                        votes: {
                              _count: 'desc'
                        }
                  }
            ]
      });

      return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
      const session = await getServerSession(authOptions);
      const userId = (session?.user as any)?.id;
      if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
            where: { id: userId }
      });

      if (!user || !user.username) {
            return NextResponse.json({ error: 'Profile setup required' }, { status: 403 });
      }

      const isAdmin = (user as any).role === 'admin';

      const body = await req.json();
      const { name, description, link, category, isPinned, isEvent, eventId } = body;

      // Check if user already has a project in this category
      if (!isAdmin && !isEvent && !eventId) {
            const existingProject = await (prisma.project as any).findFirst({
                  where: {
                        userId: user.id,
                        category: category,
                        eventId: null
                  }
            });

            if (existingProject) {
                  return NextResponse.json({
                        error: `You already have a project in the ${category} category.`
                  }, { status: 400 });
            }
      }

      const project = await (prisma.project as any).create({
            data: {
                  name,
                  description,
                  link,
                  category,
                  userId: user.id,
                  isPinned: isAdmin ? (isPinned || false) : false,
                  isEvent: isAdmin ? (isEvent || false) : false,
                  eventId: eventId || null,
            }
      });

      return NextResponse.json(project);
}
