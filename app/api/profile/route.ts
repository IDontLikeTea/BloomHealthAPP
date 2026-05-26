import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { calculateDailyGoals, calculateWaterGoal } from '@/lib/calorie-calculator';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    const aiCompanion = await prisma.aICompanion.findUnique({
      where: { userId },
    });

    const trackerCustomization = await prisma.trackerCustomization.findUnique({
      where: { userId },
    });

    return NextResponse.json({ profile, aiCompanion, trackerCustomization });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
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
    const { companionName, height, weight, age, gender, goalType, activityLevel, useMetric = true } = body;

    // Calculate goals (height and weight already converted to metric by frontend)
    const goals = calculateDailyGoals(
      parseFloat(weight),
      parseFloat(height),
      parseInt(age),
      gender,
      activityLevel,
      goalType
    );

    const waterGoal = calculateWaterGoal(parseFloat(weight));

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId },
      update: {
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        gender,
        goalType,
        activityLevel,
        useMetric,
        dailyCalorieGoal: goals.calories,
        dailyProteinGoal: goals.protein,
        dailyCarbsGoal: goals.carbs,
        dailyFatGoal: goals.fat,
        dailyWaterGoal: waterGoal,
      },
      create: {
        userId,
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: parseInt(age),
        gender,
        goalType,
        activityLevel,
        useMetric,
        dailyCalorieGoal: goals.calories,
        dailyProteinGoal: goals.protein,
        dailyCarbsGoal: goals.carbs,
        dailyFatGoal: goals.fat,
        dailyWaterGoal: waterGoal,
      },
    });

    // Update AI companion name
    await prisma.aICompanion.upsert({
      where: { userId },
      update: { name: companionName },
      create: {
        userId,
        name: companionName,
        personality: 'supportive',
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully', goals });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Handle tracker customization update
    if (body.trackerCustomization) {
      const { shape, primaryColor, secondaryColor, useGradient } = body.trackerCustomization;
      await prisma.trackerCustomization.upsert({
        where: { userId },
        update: { shape, primaryColor, secondaryColor, useGradient },
        create: { userId, shape, primaryColor, secondaryColor, useGradient },
      });
    }

    // Handle AI companion update
    if (body.aiCompanion) {
      const { name, personality } = body.aiCompanion;
      await prisma.aICompanion.upsert({
        where: { userId },
        update: { name, personality },
        create: { userId, name: name || 'Bloom', personality: personality || 'supportive' },
      });
    }

    // Handle profile update (including useMetric and calorie goals)
    if (body.profile) {
      const { useMetric, dailyCalorieGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal, dailyWaterGoal, compassionateMode } = body.profile;
      
      const updateData: any = {};
      if (useMetric !== undefined) updateData.useMetric = useMetric;
      if (compassionateMode !== undefined) updateData.compassionateMode = compassionateMode;
      if (dailyCalorieGoal !== undefined) updateData.dailyCalorieGoal = parseInt(dailyCalorieGoal);
      if (dailyProteinGoal !== undefined) updateData.dailyProteinGoal = parseInt(dailyProteinGoal);
      if (dailyCarbsGoal !== undefined) updateData.dailyCarbsGoal = parseInt(dailyCarbsGoal);
      if (dailyFatGoal !== undefined) updateData.dailyFatGoal = parseInt(dailyFatGoal);
      if (dailyWaterGoal !== undefined) updateData.dailyWaterGoal = parseInt(dailyWaterGoal);
      
      if (Object.keys(updateData).length > 0) {
        await prisma.profile.update({
          where: { userId },
          data: updateData,
        });
      }
    }

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
