import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name, mealType, calories, protein, carbs, fat } = body;

    if (!name || !calories) {
      return NextResponse.json({ error: 'Name and calories are required' }, { status: 400 });
    }

    const meal = await prisma.meal.create({
      data: {
        userId,
        name: name,
        mealType: mealType || 'snack',
        calories: Math.round(Number(calories) || 0),
        protein: Math.round(Number(protein) || 0),
        carbs: Math.round(Number(carbs) || 0),
        fat: Math.round(Number(fat) || 0),
        isAIGenerated: true,
      },
    });

    // Update meal streak
    const streak = await prisma.streak.findUnique({
      where: { userId_type: { userId, type: 'meal_logging' } },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (streak) {
      const lastDate = new Date(streak.lastDate);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        await prisma.streak.update({
          where: { userId_type: { userId, type: 'meal_logging' } },
          data: { count: streak.count + 1, lastDate: new Date() },
        });
      } else if (diffDays > 1) {
        await prisma.streak.update({
          where: { userId_type: { userId, type: 'meal_logging' } },
          data: { count: 1, lastDate: new Date() },
        });
      }
    } else {
      await prisma.streak.create({
        data: { userId, type: 'meal_logging', count: 1 },
      });
    }

    return NextResponse.json({ success: true, meal });
  } catch (error) {
    console.error('Agent log meal error:', error);
    return NextResponse.json({ error: 'Failed to log meal' }, { status: 500 });
  }
}
