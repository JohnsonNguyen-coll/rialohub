import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
      const { searchParams } = new URL(req.url);
      const timeRange = searchParams.get('timeRange') || 'week'; // day, week, month, all

      let startDate: Date | undefined = new Date();
      if (timeRange === 'day') {
            startDate.setDate(startDate.getDate() - 1);
      } else if (timeRange === 'week') {
            startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
      } else {
            startDate = undefined; // All time
      }

      try {
            // Fetch users with projects and their votes to calculate ranking
            const users = await prisma.user.findMany({
                  where: {
                        username: { not: null }
                  },
                  include: {
                        projects: {
                              include: {
                                    votes: {
                                          where: startDate ? {
                                                createdAt: { gte: startDate }
                                          } : {}
                                    },
                                    _count: {
                                          select: { votes: true }
                                    }
                              }
                        },
                        _count: {
                              select: { projects: true }
                        }
                  }
            });

            // Map and calculate metrics for "Top Builders"
            const builders = users.map(user => {
                  // Calculate votes received ONLY in the selected time range
                  const rangeVotes = user.projects.reduce((sum, project) => sum + project.votes.length, 0);

                  // Calculate total votes (all time)
                  const totalVotes = user.projects.reduce((sum, project) => sum + project._count.votes, 0);

                  // Calculate projects created in the selected time range
                  const recentProjects = user.projects.filter(p => !startDate || new Date(p.createdAt) >= startDate).length;

                  return {
                        id: user.id,
                        username: user.username,
                        image: user.image,
                        twitterHandle: user.twitterHandle,
                        rangeVotes,
                        totalVotes,
                        recentProjects,
                        totalProjects: user._count.projects
                  };
            });

            // Sort by range votes primarily
            const sortedBuilders = builders.sort((a, b) => {
                  if (b.rangeVotes !== a.rangeVotes) {
                        return b.rangeVotes - a.rangeVotes;
                  }
                  if (b.totalVotes !== a.totalVotes) {
                        return b.totalVotes - a.totalVotes;
                  }
                  return b.recentProjects - a.recentProjects;
            });

            return NextResponse.json(sortedBuilders.slice(0, 50));
      } catch (error) {
            console.error('Error fetching builders:', error);
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
}
