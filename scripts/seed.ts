import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      hashedPassword,
      // Create profile
      profile: {
        create: {
          height: 175,
          weight: 70,
          age: 30,
          gender: 'male',
          activityLevel: 'moderate',
          goalType: 'wellness',
          dailyCalorieGoal: 2200,
          dailyProteinGoal: 110,
          dailyCarbsGoal: 250,
          dailyFatGoal: 75,
          dailyWaterGoal: 2300,
        },
      },
      // Create AI companion
      aiCompanion: {
        create: {
          name: 'Bloom',
          personality: 'supportive',
        },
      },
      // Create tracker customization
      trackerCustomization: {
        create: {
          shape: 'heart',
          primaryColor: '#FFB6C1',
          secondaryColor: '#DDA0DD',
          useGradient: true,
        },
      },
      // Create notification settings
      notificationSettings: {
        create: {
          mealReminders: true,
          waterReminders: true,
          exerciseReminders: true,
        },
      },
      // Create streaks
      streaks: {
        create: [
          { type: 'meal_logging', count: 5 },
          { type: 'water', count: 7 },
          { type: 'exercise', count: 3 },
        ],
      },
    },
  });

  console.log('Created test user:', testUser.email);

  // Create some sample meals for today
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sampleMeals = [
    {
      name: 'Oatmeal with Berries',
      mealType: 'breakfast',
      calories: 350,
      protein: 12,
      carbs: 55,
      fat: 8,
      loggedAt: new Date(today.setHours(8, 30, 0, 0)),
    },
    {
      name: 'Grilled Chicken Salad',
      mealType: 'lunch',
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 20,
      loggedAt: new Date(today.setHours(12, 30, 0, 0)),
    },
    {
      name: 'Greek Yogurt',
      mealType: 'snack',
      calories: 150,
      protein: 15,
      carbs: 12,
      fat: 5,
      loggedAt: new Date(today.setHours(15, 0, 0, 0)),
    },
  ];

  for (const meal of sampleMeals) {
    await prisma.meal.create({
      data: {
        userId: testUser.id,
        ...meal,
      },
    });
  }

  console.log('Created sample meals');

  // Create sample exercises
  const sampleExercises = [
    {
      name: 'Morning Walk',
      type: 'cardio',
      duration: 30,
      caloriesBurned: 150,
      intensity: 'low',
      loggedAt: new Date(today.setHours(7, 0, 0, 0)),
    },
    {
      name: 'Yoga Session',
      type: 'flexibility',
      duration: 45,
      caloriesBurned: 120,
      intensity: 'moderate',
      loggedAt: new Date(yesterday.setHours(18, 0, 0, 0)),
    },
  ];

  for (const exercise of sampleExercises) {
    await prisma.exercise.create({
      data: {
        userId: testUser.id,
        ...exercise,
      },
    });
  }

  console.log('Created sample exercises');

  // Create water logs
  for (let i = 0; i < 5; i++) {
    await prisma.waterLog.create({
      data: {
        userId: testUser.id,
        amount: 250,
        loggedAt: new Date(new Date().setHours(8 + i * 2, 0, 0, 0)),
      },
    });
  }

  console.log('Created sample water logs');

  console.log('Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
