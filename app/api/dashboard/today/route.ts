import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [meals, exercises, waterLogs] = await Promise.all([
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

    return NextResponse.json({ meals, exercises, waterLogs });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
