import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { ExerciseList } from '@/components/exercise/exercise-list';

export const dynamic = 'force-dynamic';

export default async function ExercisePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Get recent exercises
  const exercises = await prisma.exercise.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 30,
  });

  return <ExerciseList exercises={exercises} />;
}
