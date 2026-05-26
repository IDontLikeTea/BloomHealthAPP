import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { CompanionChat } from '@/components/companion/companion-chat';

export const dynamic = 'force-dynamic';

export default async function CompanionPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const [aiCompanion, profile, recentMessages] = await Promise.all([
    prisma.aICompanion.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  // Get today's summary for context
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayMeals, todayExercises] = await Promise.all([
    prisma.meal.findMany({
      where: { userId, loggedAt: { gte: today, lt: tomorrow } },
    }),
    prisma.exercise.findMany({
      where: { userId, loggedAt: { gte: today, lt: tomorrow } },
    }),
  ]);

  const totalCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const caloriesBurned = todayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0);

  const context = {
    companionName: aiCompanion?.name || 'Bloom',
    profile: {
      goalType: profile?.goalType,
      calorieGoal: profile?.dailyCalorieGoal,
    },
    todaySummary: {
      caloriesConsumed: totalCalories,
      caloriesBurned,
      netCalories: totalCalories - caloriesBurned,
      mealsLogged: todayMeals.length,
      exercisesLogged: todayExercises.length,
    },
    recentMessages: recentMessages.reverse(),
  };

  return <CompanionChat initialContext={context} />;
}
