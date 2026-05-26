import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  // Get user data
  const [aiCompanion, trackerCustomization, streaks] = await Promise.all([
    prisma.aICompanion.findUnique({ where: { userId } }),
    prisma.trackerCustomization.findUnique({ where: { userId } }),
    prisma.streak.findMany({ where: { userId } }),
  ]);

  // Get today's data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayMeals, todayExercises, todayWater] = await Promise.all([
    prisma.meal.findMany({
      where: {
        userId,
        loggedAt: { gte: today, lt: tomorrow },
      },
      orderBy: { loggedAt: 'desc' },
    }),
    prisma.exercise.findMany({
      where: {
        userId,
        loggedAt: { gte: today, lt: tomorrow },
      },
      orderBy: { loggedAt: 'desc' },
    }),
    prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: { gte: today, lt: tomorrow },
      },
    }),
  ]);

  const initialData = {
    profile,
    aiCompanion,
    trackerCustomization,
    streaks,
    todayMeals,
    todayExercises,
    todayWater,
    userName: session.user.name || 'Friend',
    compassionateMode: profile.compassionateMode ?? true,
  };

  return <DashboardClient initialData={initialData} />;
}
