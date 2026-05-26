import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { StatsClient } from '@/components/stats/stats-client';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Get last 7 days of data
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [profile, meals, exercises, waterLogs, streaks] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.meal.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
      orderBy: { loggedAt: 'asc' },
    }),
    prisma.exercise.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
      orderBy: { loggedAt: 'asc' },
    }),
    prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: sevenDaysAgo } },
    }),
    prisma.streak.findMany({ where: { userId } }),
  ]);

  return (
    <StatsClient
      profile={profile}
      meals={meals}
      exercises={exercises}
      waterLogs={waterLogs}
      streaks={streaks}
    />
  );
}
