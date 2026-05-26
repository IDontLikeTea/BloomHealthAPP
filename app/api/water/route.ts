import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let whereClause: any = { userId };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.loggedAt = { gte: startDate, lt: endDate };
    }

    const waterLogs = await prisma.waterLog.findMany({
      where: whereClause,
      orderBy: { loggedAt: 'desc' },
    });

    const total = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    return NextResponse.json({ logs: waterLogs, total });
  } catch (error) {
    console.error('Get water logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch water logs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { amount } = body;

    // If negative amount, delete the most recent log instead
    if (amount < 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const recentLog = await prisma.waterLog.findFirst({
        where: {
          userId,
          loggedAt: { gte: today, lt: tomorrow },
        },
        orderBy: { loggedAt: 'desc' },
      });

      if (recentLog) {
        await prisma.waterLog.delete({ where: { id: recentLog.id } });
      }

      return NextResponse.json({ success: true, removed: true });
    }

    const waterLog = await prisma.waterLog.create({
      data: {
        userId,
        amount: parseInt(amount) || 250,
      },
    });

    // Update water streak
    await updateWaterStreak(userId);

    return NextResponse.json(waterLog);
  } catch (error) {
    console.error('Log water error:', error);
    return NextResponse.json({ error: 'Failed to log water' }, { status: 500 });
  }
}

async function updateWaterStreak(userId: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: 'water' } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (streak) {
    const lastDate = new Date(streak.lastDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return;
    
    if (diffDays === 1) {
      await prisma.streak.update({
        where: { userId_type: { userId, type: 'water' } },
        data: { count: streak.count + 1, lastDate: new Date() },
      });
    } else {
      await prisma.streak.update({
        where: { userId_type: { userId, type: 'water' } },
        data: { count: 1, lastDate: new Date() },
      });
    }
  } else {
    await prisma.streak.create({
      data: { userId, type: 'water', count: 1 },
    });
  }
}
