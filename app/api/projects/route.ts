import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

      const body = await req.json();
      const { name, description, link, category } = body;

      // Check if user already has a project in this category
      const existingProject = await prisma.project.findFirst({
            where: {
                  userId: user.id,
                  category: category
            }
      });

      if (existingProject) {
            return NextResponse.json({
                  error: `You already have a project in the ${category} category.`
            }, { status: 400 });
      }

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
