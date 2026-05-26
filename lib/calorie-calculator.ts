// Mifflin-St Jeor Equation for BMR calculation
export function calculateBMR(
  weight: number, // in kg
  height: number, // in cm
  age: number,
  gender: string
): number {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

export function getActivityMultiplier(activityLevel: string): number {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel] || 1.55;
}

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string
): number {
  const bmr = calculateBMR(weight, height, age, gender);
  const multiplier = getActivityMultiplier(activityLevel);
  return Math.round(bmr * multiplier);
}

export function calculateDailyGoals(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
  goalType: string
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const tdee = calculateTDEE(weight, height, age, gender, activityLevel);
  
  let calorieAdjustment = 0;
  let proteinMultiplier = 1.6; // g per kg of body weight
  
  switch (goalType) {
    case 'weight_loss':
      calorieAdjustment = -500; // 0.5 kg/week deficit
      proteinMultiplier = 2.0; // Higher protein for preservation
      break;
    case 'weight_gain':
      calorieAdjustment = 300; // Lean bulk surplus
      proteinMultiplier = 1.8;
      break;
    case 'muscle_building':
      calorieAdjustment = 200;
      proteinMultiplier = 2.2;
      break;
    case 'maintenance':
      calorieAdjustment = 0;
      proteinMultiplier = 1.6;
      break;
    case 'wellness':
    default:
      calorieAdjustment = 0;
      proteinMultiplier = 1.4;
      break;
  }
  
  const calories = Math.max(1200, tdee + calorieAdjustment); // Minimum safe calories
  const protein = Math.round(weight * proteinMultiplier);
  
  // Calculate fat (25-30% of calories)
  const fatCalories = calories * 0.25;
  const fat = Math.round(fatCalories / 9);
  
  // Remaining calories from carbs
  const proteinCalories = protein * 4;
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4);
  
  return {
    calories,
    protein,
    carbs,
    fat,
  };
}

export function calculateWaterGoal(weight: number): number {
  // General rule: 30-35ml per kg of body weight
  return Math.round(weight * 33);
}
