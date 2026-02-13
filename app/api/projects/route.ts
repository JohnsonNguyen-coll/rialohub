import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category');
      const userId = searchParams.get('userId');

      const projects = await prisma.project.findMany({
            where: {
                  ...(category ? { category } : {}),
                  ...(userId ? { userId } : {}),
            },
            include: {
                  user: true,
                  _count: {
                        select: { votes: true, feedback: true }
                  }
            },
            orderBy: {
                  votes: {
                        _count: 'desc'
                  }
            }
      });

      return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
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

      const body = await req.json();
      const { name, description, link, category } = body;

      const project = await prisma.project.create({
            data: {
                  name,
                  description,
                  link,
                  category,
                  userId: user.id,
            }
      });

      return NextResponse.json(project);
}
