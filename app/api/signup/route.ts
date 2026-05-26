import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with default settings
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        // Create default AI companion
        aiCompanion: {
          create: {
            name: 'Bloom',
            personality: 'supportive',
          },
        },
        // Create default tracker customization
        trackerCustomization: {
          create: {
            shape: 'heart',
            primaryColor: '#FFB6C1',
            secondaryColor: '#DDA0DD',
            useGradient: true,
          },
        },
        // Create default notification settings
        notificationSettings: {
          create: {
            mealReminders: true,
            waterReminders: true,
            exerciseReminders: true,
          },
        },
        // Initialize streaks
        streaks: {
          create: [
            { type: 'meal_logging', count: 0 },
            { type: 'water', count: 0 },
            { type: 'exercise', count: 0 },
          ],
        },
      },
    });

    return NextResponse.json({
      message: 'Account created successfully',
      userId: user.id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
