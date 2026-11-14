import { NutritionTargets } from '../types/workout';

export type NutritionGoalStrategy = 'Cutting' | 'Recomposition' | 'Bulking' | 'Maintenance' | 'Custom';

/**
 * Automatically calculates optimal macronutrients, fiber, and hydration
 * based on total daily calorie target and athletic goal strategy.
 */
export function calculateMacrosFromCalories(
  calories: number,
  strategy: NutritionGoalStrategy
): {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterGoalMl: number;
} {
  const safeCalories = Math.max(1000, Math.min(6000, calories));

  let proteinPct = 0.30;
  let fatPct = 0.25;
  let carbsPct = 0.45;
  let waterBaseMl = 3000;

  switch (strategy) {
    case 'Cutting':
      // Higher protein to spare lean muscle mass in a deficit; moderate fats for hormones, rest carbs
      proteinPct = 0.33; // 33% of calories from protein
      fatPct = 0.25;     // 25% of calories from fat
      carbsPct = 0.42;   // 42% of calories from carbs
      waterBaseMl = 3200; // Increased fluid to assist satiety and nitrogen clearance
      break;

    case 'Bulking':
      // Caloric surplus: sufficient protein for hypertrophy, higher carbs to fuel intense training & glycogen
      proteinPct = 0.26; // 26% protein
      fatPct = 0.24;     // 24% fat
      carbsPct = 0.50;   // 50% carbs
      waterBaseMl = 3300;
      break;

    case 'Recomposition':
    case 'Maintenance':
    default:
      // Balanced athletic split
      proteinPct = 0.29; // ~29% protein
      fatPct = 0.26;     // ~26% fat
      carbsPct = 0.45;   // ~45% carbs
      waterBaseMl = 3000;
      break;
  }

  // Protein = 4 kcal/g
  const proteinGrams = Math.round((safeCalories * proteinPct) / 4);

  // Fat = 9 kcal/g
  const fatGrams = Math.round((safeCalories * fatPct) / 9);

  // Remaining calories to Carbs (4 kcal/g) to ensure exact caloric match
  const remainingCalories = Math.max(0, safeCalories - (proteinGrams * 4 + fatGrams * 9));
  const carbsGrams = Math.round(remainingCalories / 4);

  // Dietary Fiber: Clinical recommendation of 14g per 1,000 calories
  const fiberGrams = Math.max(25, Math.round((safeCalories / 1000) * 14));

  // Hydration: 30-35ml per kg or indexed to caloric throughput
  const waterGoalMl = Math.round(waterBaseMl + (safeCalories / 500) * 100);

  return {
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    waterGoalMl
  };
}
