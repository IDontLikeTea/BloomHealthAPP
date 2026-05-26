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

    const meals = await prisma.meal.findMany({
      where: whereClause,
      orderBy: { loggedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 });
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
    const { name, mealType, calories, protein, carbs, fat, imageUrl, isPublic, notes, isAIGenerated, loggedAt } = body;

    const meal = await prisma.meal.create({
      data: {
        userId,
        name,
        mealType: mealType || 'snack',
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        imageUrl,
        isPublic: isPublic || false,
        notes,
        isAIGenerated: isAIGenerated || false,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    });

    // Update meal logging streak
    await updateStreak(userId, 'meal_logging');

    return NextResponse.json(meal);
  } catch (error) {
    console.error('Create meal error:', error);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}

async function updateStreak(userId: string, type: string) {
  const streak = await prisma.streak.findUnique({
    where: { userId_type: { userId, type } },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (streak) {
    const lastDate = new Date(streak.lastDate);
    lastDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, don't update
      return;
    } else if (diffDays === 1) {
      // Consecutive day, increment
      await prisma.streak.update({
        where: { userId_type: { userId, type } },
        data: { count: streak.count + 1, lastDate: new Date() },
      });
    } else {
      // Streak broken, reset
      await prisma.streak.update({
        where: { userId_type: { userId, type } },
        data: { count: 1, lastDate: new Date() },
      });
    }
  } else {
    await prisma.streak.create({
      data: { userId, type, count: 1 },
    });
  }
}
