import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(
      req: NextRequest,
      { params }: { params: Promise<{ id: string }> }
) {
      try {
            const { id } = await params;
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            if (!userId) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const user: any = await prisma.user.findUnique({
                  where: { id: userId }
            });

            if (!user || user.role !== 'admin') {
                  return NextResponse.json({ error: 'Admin only' }, { status: 403 });
            }

            let isTop: boolean;
            try {
                  const body = await req.json();
                  isTop = !!body.isTop;
            } catch (e) {
                  const current: any = await prisma.project.findUnique({ where: { id } });
                  isTop = !current?.isTop;
            }

            const project = await (prisma.project as any).update({
                  where: { id },
                  data: { isTop }
            });

            return NextResponse.json(project);
      } catch (error: any) {
            console.error('Error toggling top:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}
