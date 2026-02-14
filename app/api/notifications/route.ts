import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
      try {
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            if (!userId) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const notifications = await (prisma as any).notification.findMany({
                  where: { userId: userId },
                  include: {
                        from: { select: { username: true } },
                        project: { select: { name: true, id: true } }
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 20
            });

            return NextResponse.json(notifications);
      } catch (error: any) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}

export async function PATCH(req: NextRequest) {
      try {
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            if (!userId) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            await (prisma as any).notification.updateMany({
                  where: { userId: userId, isRead: false },
                  data: { isRead: true }
            });

            return NextResponse.json({ success: true });
      } catch (error: any) {
            console.error('Error marking notifications as read:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
      }
}
