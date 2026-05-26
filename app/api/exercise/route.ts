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

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { loggedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 });
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
    const { name, type, duration, caloriesBurned, intensity, notes } = body;

    const exercise = await prisma.exercise.create({
      data: {
        userId,
        name,
        type: type || 'other',
        duration: parseInt(duration) || 0,
        caloriesBurned: parseInt(caloriesBurned) || 0,
        intensity,
        notes,
      },
    });

    // Update exercise streak
    await updateExerciseStreak(userId);

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Create exercise error:', error);
    return NextResponse.json({ error: 'Failed to log exercise' }, { status: 500 });
  }
}

async function updateExerciseStreak(userId: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type: 'exercise' } },
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
        where: { userId_type: { userId, type: 'exercise' } },
        data: { count: streak.count + 1, lastDate: new Date() },
      });
    } else {
      await prisma.streak.update({
        where: { userId_type: { userId, type: 'exercise' } },
        data: { count: 1, lastDate: new Date() },
      });
    }
  } else {
    await prisma.streak.create({
      data: { userId, type: 'exercise', count: 1 },
    });
  }
}
