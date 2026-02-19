import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      try {
            // Fetch users with projects and their votes to calculate weekly ranking
            const users = await prisma.user.findMany({
                  where: {
                        username: { not: null }
                  },
                  include: {
                        projects: {
                              include: {
                                    votes: {
                                          where: {
                                                createdAt: { gte: oneWeekAgo }
                                          }
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
                  // Calculate votes received ONLY this week
                  const weeklyVotes = user.projects.reduce((sum, project) => sum + project.votes.length, 0);

                  // Calculate total votes (all time)
                  const totalVotes = user.projects.reduce((sum, project) => sum + project._count.votes, 0);

                  // Calculate projects created this week
                  const recentProjects = user.projects.filter(p => new Date(p.createdAt) >= oneWeekAgo).length;

                  return {
                        id: user.id,
                        username: user.username,
                        image: user.image,
                        twitterHandle: user.twitterHandle,
                        weeklyVotes,
                        totalVotes,
                        recentProjects,
                        totalProjects: user._count.projects
                  };
            });

            // Sort by weekly votes primarily
            const sortedBuilders = builders.sort((a, b) => {
                  if (b.weeklyVotes !== a.weeklyVotes) {
                        return b.weeklyVotes - a.weeklyVotes;
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
