import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MealsHistory } from '@/components/meals/meals-history';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const meals = await prisma.meal.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 50,
  });

  return <MealsHistory meals={meals} />;
}
